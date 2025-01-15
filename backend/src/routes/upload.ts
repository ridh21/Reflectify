import express, { Router, Request, Response } from 'express';
import multer, { Multer, StorageEngine } from 'multer';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

const router: Router = express.Router();
const prisma: PrismaClient = new PrismaClient();

interface LectureData {
  designated_faculty: string;
}

interface LabData {
  designated_faculty: string;
}

interface SubjectData {
  lectures: LectureData;
  labs?: {
    [batch: string]: LabData;
  };
}

interface DivisionData {
  [subject: string]: SubjectData;
}

interface SemesterData {
  [division: string]: DivisionData;
}

interface DepartmentData {
  [semester: string]: SemesterData;
}

interface CollegeData {
  [department: string]: DepartmentData;
}

interface ProcessedData {
  [college: string]: CollegeData;
}

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/octet-stream',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload: Multer = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  '/faculty-matrix',
  upload.single('facultyMatrix'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('1. Faculty matrix request received');

      if (!req.file) {
        console.log('No file received in request');
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      console.log('2. File details:', {
        filename: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });

      const form = new FormData();
      try {
        form.append('facultyMatrix', fs.createReadStream(req.file.path));
        console.log('3. FormData created successfully');
      } catch (err) {
        console.log('Error creating FormData:', err);
        throw err;
      }

      console.log('4. Attempting to send to Python server...');
      try {
        const pythonResponse = await fetch(
          'http://localhost:8000/faculty-matrix',
          {
            method: 'POST',
            body: form,
            headers: form.getHeaders(),
          }
        );
        console.log('5. Python server response status:', pythonResponse.status);

        const responseText = await pythonResponse.text();
        console.log('6. Raw response:', responseText);

        const processedData = JSON.parse(responseText) as ProcessedData;
        console.log('7. Parsed data successfully:', processedData);

        let stats = {
          departments: 0,
          semesters: 0,
          divisions: 0,
          subjects: 0,
          faculties: 0,
          allocations: 0,
        };

        console.log('8. Starting database operations');
        const department = await prisma.departments.upsert({
          where: { code: 'CE' },
          update: {},
          create: { name: 'Computer Engineering', code: 'CE' },
        });
        stats.departments++;
        console.log('9. Department created:', department);

        for (const [collegeName, collegeData] of Object.entries(
          processedData
        )) {
          console.log(`10. Processing college: ${collegeName}`);

          for (const [deptName, deptData] of Object.entries(collegeData)) {
            for (const [semesterNum, semData] of Object.entries(deptData)) {
              const semesterEntry = await prisma.semesters.upsert({
                where: { id: `${department.id}_${semesterNum}` },
                update: {},
                create: {
                  id: `${department.id}_${semesterNum}`,
                  name: `Semester ${semesterNum}`,
                  department_id: department.id,
                },
              });
              stats.semesters++;

              for (const [divisionName, divData] of Object.entries(semData)) {
                const divisionEntry = await prisma.divisions.upsert({
                  where: { id: `${semesterEntry.id}_${divisionName}` },
                  update: {},
                  create: {
                    id: `${semesterEntry.id}_${divisionName}`,
                    name: divisionName,
                    semester_id: semesterEntry.id,
                    department_id: department.id,
                  },
                });
                stats.divisions++;

                for (const [subjectCode, subjectData] of Object.entries(
                  divData as DivisionData
                )) {
                  const subjectEntry = await prisma.subjects.upsert({
                    where: { code: subjectCode },
                    update: {},
                    create: {
                      name: subjectCode,
                      code: subjectCode,
                      department_id: department.id,
                      semester_id: semesterEntry.id,
                    },
                  });
                  stats.subjects++;

                  if (subjectData.lectures?.designated_faculty) {
                    const faculty = await prisma.faculties.upsert({
                      where: {
                        email: `${subjectData.lectures.designated_faculty}@example.com`,
                      },
                      update: {},
                      create: {
                        name: subjectData.lectures.designated_faculty,
                        email: `${subjectData.lectures.designated_faculty}@example.com`,
                      },
                    });
                    stats.faculties++;

                    await prisma.subjectAllocations.create({
                      data: {
                        subject_id: subjectEntry.id,
                        faculty_id: faculty.id,
                        division_id: divisionEntry.id,
                        semester_id: semesterEntry.id,
                      },
                    });
                    stats.allocations++;
                  }

                  if (subjectData.labs) {
                    for (const [batch, labData] of Object.entries(
                      subjectData.labs
                    )) {
                      const faculty = await prisma.faculties.upsert({
                        where: {
                          email: `${labData.designated_faculty}@example.com`,
                        },
                        update: {},
                        create: {
                          name: labData.designated_faculty,
                          email: `${labData.designated_faculty}@example.com`,
                        },
                      });
                      stats.faculties++;

                      await prisma.subjectAllocations.create({
                        data: {
                          subject_id: subjectEntry.id,
                          faculty_id: faculty.id,
                          division_id: divisionEntry.id,
                          semester_id: semesterEntry.id,
                        },
                      });
                      stats.allocations++;
                    }
                  }
                }
              }
            }
          }
        }

        console.log('15. Final statistics:', stats);

        res.status(200).json({
          message: 'Faculty matrix processed successfully',
          stats,
        });
      } catch (fetchError) {
        console.log('Error during Python server communication:', fetchError);
        throw fetchError;
      }
    } catch (error) {
      console.error('Main error:', error);
      res.status(500).json({
        message: 'Error processing faculty matrix',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      await prisma.$disconnect();
    }
  }
);

// router.post(
//   '/student-data',
//   upload.single('studentData'),
//   async (req: Request, res: Response): Promise<void> => {
//     try {
//       console.log('1. Request received');
//       console.log('Request file:', req.file);

//       if (!req.file) {
//         console.log('No file detected in request');
//         res.status(400).json({ message: 'No file uploaded' });
//         return;
//       }

//       const workbook: ExcelJS.Workbook = new ExcelJS.Workbook();
//       await workbook.xlsx.readFile(req.file.path);

//       const worksheet = workbook.getWorksheet(1);
//       console.log('2. Worksheet loaded:', worksheet?.rowCount, 'rows');

//       if (!worksheet) {
//         res.status(400).json({ message: 'Invalid worksheet' });
//         return;
//       }

//       const departmentSet = new Set<string>();
//       const semesterSet = new Set<string>();
//       const divisionSet = new Set<string>();

//       for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
//         const row = worksheet.getRow(rowNumber);
//         departmentSet.add(row.getCell(4).value?.toString() || '');
//         semesterSet.add(row.getCell(5).value?.toString() || '');
//         divisionSet.add(row.getCell(6).value?.toString() || '');
//       }

//       // Create departments and their semesters
//       for (const deptCode of departmentSet) {
//         const department = await prisma.departments.upsert({
//           where: { code: deptCode },
//           update: {},
//           create: {
//             name: deptCode,
//             code: deptCode,
//           },
//         });

//         // Create semesters for this department
//         for (const semValue of semesterSet) {
//           await prisma.semesters.upsert({
//             where: {
//               id: `${department.id}_${semValue}`,
//             },
//             update: {},
//             create: {
//               id: `${department.id}_${semValue}`,
//               name: `Semester ${semValue}`,
//               department_id: department.id,
//             },
//           });
//         }
//       }

//       const students: StudentData[] = [];
//       for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
//         const row = worksheet.getRow(rowNumber);

//         const deptCode = row.getCell(4).value?.toString() || '';
//         const semValue = row.getCell(5).value?.toString() || '';
//         const divValue = row.getCell(6).value?.toString() || '';

//         const department = await prisma.departments.findUnique({
//           where: { code: deptCode },
//         });
//         if (!department) continue;

//         const semester = await prisma.semesters.findUnique({
//           where: { id: `${department.id}_${semValue}` },
//         });
//         if (!semester) continue;

//         const division = await prisma.divisions.upsert({
//           where: { id: divValue },
//           update: {},
//           create: {
//             id: divValue,
//             name: divValue,
//             semester_id: semester.id,
//             department_id: department.id,
//           },
//         });

//         const studentData: StudentData = {
//           name: row.getCell(2).value?.toString() || '',
//           roll_no: row.getCell(3).value?.toString() || '',
//           email: row.getCell(7).value?.toString() || '',
//           academic_year: new Date().getFullYear().toString(),
//           department_id: department.id,
//           semester_id: semester.id,
//           division_id: division.id,
//         };

//         students.push(studentData);
//       }

//       const result = await prisma.students.createMany({
//         data: students,
//         skipDuplicates: true,
//       });

//       res.status(200).json({
//         message: 'Students added successfully',
//         count: result.count,
//       });
//     } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({
//         message: 'Error uploading students',
//         error: error instanceof Error ? error.message : 'Unknown error',
//       });
//     } finally {
//       await prisma.$disconnect();
//     }
//   }
// );

export default router;
