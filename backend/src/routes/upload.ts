import express, { Router, Request, Response } from 'express';
import multer, { Multer, StorageEngine } from 'multer';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

const router: Router = express.Router();
const prisma: PrismaClient = new PrismaClient();

interface ProcessedData {
  [college: string]: {
    [department: string]: {
      [semester: string]: {
        [division: string]: {
          [subject: string]: {
            lectures: { designated_faculty: string };
            labs?: { [batch: string]: { designated_faculty: string } };
          };
        };
      };
    };
  };
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
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  '/faculty-matrix',
  upload.single('facultyMatrix'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const form = new FormData();
      form.append('facultyMatrix', fs.createReadStream(req.file.path));

      const pythonResponse = await fetch(
        'http://localhost:8000/faculty-matrix',
        {
          method: 'POST',
          body: form,
          headers: form.getHeaders(),
        }
      );

      if (!pythonResponse.ok) {
        const errorText = await pythonResponse.text();
        res
          .status(pythonResponse.status)
          .json({ message: 'Python processing failed', details: errorText });
        return;
      }

      const processedData = JSON.parse(
        await pythonResponse.text()
      ) as ProcessedData;

      for (const [collegeName, collegeData] of Object.entries(processedData)) {
        const college = await prisma.college.upsert({
          where: { id: collegeName },
          create: {
            id: collegeName,
            name: collegeName,
            websiteUrl: '',
            address: '',
            contactNumber: '',
            logo: '',
            images: {},
          },
          update: {},
        });

        for (const [deptName, deptData] of Object.entries(collegeData)) {
          const department = await prisma.department.upsert({
            where: { id: deptName },
            create: {
              id: deptName,
              name: deptName,
              abbreviation: deptName,
              hodName: '',
              hodEmail: '',
              collegeId: college.id,
            },
            update: {},
          });

          for (const [semesterNum, semData] of Object.entries(deptData)) {
            const semester = await prisma.semester.upsert({
              where: { id: semesterNum },
              create: {
                id: semesterNum,
                departmentId: department.id,
                semesterNumber: parseInt(semesterNum),
                academicYear: new Date().getFullYear().toString(),
              },
              update: {},
            });

            for (const [divisionName, divData] of Object.entries(semData)) {
              const division = await prisma.division.upsert({
                where: { id: divisionName },
                create: {
                  id: divisionName,
                  departmentId: department.id,
                  semesterId: semester.id,
                  divisionName: divisionName,
                  studentCount: 0,
                },
                update: {},
              });

              for (const [subjectCode, subjectData] of Object.entries(
                divData
              )) {
                let subject = await prisma.subject.findFirst({
                  where: { abbreviation: subjectCode },
                });

                if (!subject) {
                  subject = await prisma.subject.create({
                    data: {
                      name: subjectCode,
                      abbreviation: subjectCode,
                      subjectCode: subjectCode,
                      departmentId: department.id,
                      semesterId: semester.id,
                    },
                  });
                }

                if (subjectData.lectures?.designated_faculty) {
                  let faculty = await prisma.faculty.findFirst({
                    where: {
                      abbreviation: subjectData.lectures.designated_faculty,
                    },
                  });

                  if (!faculty) {
                    faculty = await prisma.faculty.create({
                      data: {
                        name: subjectData.lectures.designated_faculty,
                        abbreviation: subjectData.lectures.designated_faculty,
                        email: `${subjectData.lectures.designated_faculty.toLowerCase()}@ldrp.ac.in`,
                        designation: 'Assistant Professor',
                        seatingLocation: `${department.id} Department`,
                        joiningDate: new Date(),
                        departmentId: department.id,
                      },
                    });
                    console.log(`✓ Created faculty: ${faculty.name}`);
                  }

                  await prisma.subjectAllocation.upsert({
                    where: {
                      facultyId_subjectId_divisionId_semesterId_lectureType: {
                        facultyId: faculty.id,
                        subjectId: subject.id,
                        divisionId: division.id,
                        semesterId: semester.id,
                        lectureType: 'LECTURE',
                      },
                    },
                    create: {
                      facultyId: faculty.id,
                      subjectId: subject.id,
                      divisionId: division.id,
                      semesterId: semester.id,
                      lectureType: 'LECTURE',
                      academicYear: new Date().getFullYear().toString(),
                    },
                    update: {},
                  });
                }

                if (subjectData.labs) {
                  for (const [batch, labData] of Object.entries(
                    subjectData.labs
                  )) {
                    if (labData.designated_faculty) {
                      let labFaculty = await prisma.faculty.findFirst({
                        where: { abbreviation: labData.designated_faculty },
                      });

                      if (!labFaculty) {
                        labFaculty = await prisma.faculty.create({
                          data: {
                            name: labData.designated_faculty,
                            abbreviation: labData.designated_faculty,
                            email: `${labData.designated_faculty.toLowerCase()}@ldrp.ac.in`,
                            designation: 'Assistant Professor',
                            seatingLocation: `${department.id} Department`,
                            joiningDate: new Date(),
                            departmentId: department.id,
                          },
                        });
                        console.log(
                          `✓ Created lab faculty: ${labFaculty.name}`
                        );
                      }

                      await prisma.subjectAllocation.upsert({
                        where: {
                          facultyId_subjectId_divisionId_semesterId_lectureType:
                            {
                              facultyId: labFaculty.id,
                              subjectId: subject.id,
                              divisionId: division.id,
                              semesterId: semester.id,
                              lectureType: 'LAB',
                            },
                        },
                        create: {
                          facultyId: labFaculty.id,
                          subjectId: subject.id,
                          divisionId: division.id,
                          semesterId: semester.id,
                          lectureType: 'LAB',
                          academicYear: new Date().getFullYear().toString(),
                        },
                        update: {},
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }

      res
        .status(200)
        .json({ message: 'Faculty matrix processed successfully' });
    } catch (error) {
      console.error('Error processing faculty matrix:', error);
      res.status(500).json({
        message: 'Error processing faculty matrix',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      await prisma.$disconnect();
    }
  }
);

export default router;
