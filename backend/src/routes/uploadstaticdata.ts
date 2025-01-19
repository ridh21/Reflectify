import express, { Router, Request, Response } from 'express';
import multer, { Multer, StorageEngine } from 'multer';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router: Router = express.Router();
const prisma: PrismaClient = new PrismaClient();

const departmentCache = new Map();
const collegeCache = new Map();

interface StudentData {
  name: string;
  enrollmentNumber: string;
  email: string;
  phoneNumber: string;
  academicYear: string;
  batch: string;
  departmentId: string;
  semesterId: string;
  divisionId: string;
}

interface FacultyData {
  name: string;
  email: string;
  abbreviation: string;
  designation: string;
  seatingLocation: string;
  departmentId: string;
  joiningDate: Date;
}

interface SubjectData {
  name: string;
  abbreviation: string;
  subjectCode: string;
  type: 'MANDATORY' | 'ELECTIVE';
  departmentId: string;
  semesterId: string;
}

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post( '/faculty-data',
  upload.single('facultyData'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(req.file.buffer);
      const worksheet = workbook.getWorksheet(1);

      if (!worksheet) {
        res.status(400).json({ message: 'Invalid worksheet' });
        return;
      }

      const batchSize = 50;
      let batch = [];
      const processedRows = [];

      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const collegeName = row.getCell(6).value?.toString() || '';
        const deptName = row.getCell(5).value?.toString() || '';

        let college = collegeCache.get(collegeName);
        if (!college) {
          college = await prisma.college.upsert({
            where: { id: uuidv4() },
            create: {
              id: uuidv4(),
              name: collegeName,
              websiteUrl: `https://www.${collegeName.toLowerCase()}.ac.in`,
              address: 'Gujarat',
              contactNumber: '1234567890',
              logo: `${collegeName.toLowerCase()}_logo.png`,
              images: {},
            },
            update: {},
          });
          collegeCache.set(collegeName, college);
        }

        let department = departmentCache.get(deptName);
        if (!department) {
          department = await prisma.department.upsert({
            where: { id: uuidv4() },
            create: {
              id: uuidv4(),
              name: deptName,
              abbreviation: deptName,
              hodName: `HOD of ${deptName}`,
              hodEmail: `hod.${deptName.toLowerCase()}@ldrp.ac.in`,
              collegeId: college.id,
            },
            update: {
              name: `Department of ${deptName}`,
              abbreviation: deptName,
            },
          });
          departmentCache.set(deptName, department);
        }

        const facultyData = {
          id: uuidv4(),
          name: row.getCell(2).value?.toString() || '',
          email: row.getCell(3).value?.toString() || '',
          abbreviation: row.getCell(4).value?.toString() || '',
          designation: 'Assistant Professor',
          seatingLocation: `${deptName} Department`,
          departmentId: department.id,
          joiningDate: new Date(),
        };

        batch.push(facultyData);
        processedRows.push(facultyData);

        if (batch.length >= batchSize || rowNumber === worksheet.rowCount) {
          await prisma.faculty.createMany({
            data: batch,
            skipDuplicates: true,
          });
          batch = [];
        }
      }

      res.status(200).json({
        message: 'Faculty data updated successfully',
        count: processedRows.length,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        message: 'Error processing faculty data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      departmentCache.clear();
      collegeCache.clear();
    }
  }
);

// router.post( '/student-data',
//   // isAuthenticated,
//   // isAdmin,
//   upload.single('studentData'),
//   async (req: Request, res: Response): Promise<void> => {
//     try {
//       if (!req.file) {
//         res.status(400).json({ message: 'No file uploaded' });
//         return;
//       }
//       console.log('This is the file, ', req.file);
//       const workbook = new ExcelJS.Workbook();
//       await workbook.xlsx.readFile(req.file.path);
//       const worksheet = workbook.getWorksheet(1);

//       if (!worksheet) {
//         res.status(400).json({ message: 'Invalid worksheet' });
//         return;
//       }

//       const students: StudentData[] = [];

//       for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
//         const row = worksheet.getRow(rowNumber);

//         if (!row) {
//           res.status(400).json({ message: 'Invalid worksheet' });
//           return;
//         }

//         const departmentData = row.getCell(4).value?.toString();
//         const semesterData = row.getCell(5).value?.toString();
//         const divisionData = row.getCell(6).value?.toString();

//         if (!departmentData) {
//           res.status(400).json({ message: 'Invalid department data' });
//           return;
//         }

//         if (!semesterData) {
//           res.status(400).json({ message: 'Invalid semester data' });
//           return;
//         }

//         if (!divisionData) {
//           res.status(400).json({ message: 'Invalid division data' });
//           return;
//         }

//         const department = await prisma.department.upsert({
//           where: { id: `${departmentData}` },
//           create: {
//             id: `${departmentData}`,
//             name: `${departmentData}`,
//             abbreviation: departmentData,
//             hodName: `${departmentData}`,
//             hodEmail: `hod.${departmentData.toLowerCase()}@ldrp.ac.in`,
//             collegeId: 'LDRP-ITR',
//           },
//           update: {
//             name: `${departmentData}`,
//             abbreviation: departmentData,
//           },
//         });

//         const semester = await prisma.semester.upsert({
//           where: { id: `${semesterData}` },
//           create: {
//             id: `${semesterData}`,
//             departmentId: department.id,
//             semesterNumber: parseInt(semesterData || '1'),
//             academicYear: new Date().getFullYear().toString(),
//           },
//           update: {},
//         });

//         const division = await prisma.division.upsert({
//           where: { id: `${divisionData}` },
//           create: {
//             id: `${divisionData}`,
//             departmentId: department.id,
//             semesterId: semester.id,
//             divisionName: divisionData,
//             studentCount: 0,
//           },
//           update: {},
//         });

//         const studentData = {
//           name: row.getCell(2).value?.toString() || '',
//           enrollmentNumber: row.getCell(3).value?.toString() || '',
//           email: row.getCell(7).value?.toString() || '',
//           phoneNumber: row.getCell(8).value?.toString() || '',
//           academicYear: new Date().getFullYear().toString(),
//           batch: row.getCell(9).value?.toString() || 'A',
//           departmentId: department.id,
//           semesterId: semester.id,
//           divisionId: division.id,
//         };

//         if (students.find((student) => student.email === studentData.email)) {
//           res.status(400).json({ message: 'Duplicate student email' });
//           return;
//         }

//         students.push(studentData);
//       }

//       const result = await prisma.student.createMany({
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
//     }
//   }
// );

// router.post(  '/faculty-data',
//   // isAuthenticated,
//   // isAdmin,
//   upload.single('facultyData'),
//   async (req: Request, res: Response): Promise<void> => {
//     try {
//       console.log('This is the file, ', req.file);
//       if (!req.file) {
//         res.status(400).json({ message: 'No file uploaded' });
//         return;
//       }

//       const workbook = new ExcelJS.Workbook();
//       await workbook.xlsx.readFile(req.file.path);
//       const worksheet = workbook.getWorksheet(1);

//       console.log('File loaded, processing rows:', worksheet?.rowCount);

//       if (!worksheet) {
//         res.status(400).json({ message: 'Invalid worksheet' });
//         return;
//       }

//       const faculties: FacultyData[] = [];

//       for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
//         const row = worksheet.getRow(rowNumber);
//         const collegeName = row.getCell(6).value?.toString() || '';
//         const deptName = row.getCell(5).value?.toString() || '';

//         console.log('Processing row data:', {
//           name: row.getCell(2).value,
//           email: row.getCell(3).value,
//           dept: deptName,
//           college: collegeName,
//         });

//         const college = await prisma.college.upsert({
//           where: { id: `${collegeName}` },
//           create: {
//             id: `${collegeName}`,
//             name: collegeName,
//             websiteUrl: `https://www.${collegeName.toLowerCase()}.ac.in`,
//             address: 'Gujarat',
//             contactNumber: '1234567890',
//             logo: `${collegeName.toLowerCase()}_logo.png`,
//             images: {},
//           },
//           update: {},
//         });

//         const department = await prisma.department.upsert({
//           where: { id: `${deptName}` },
//           create: {
//             id: `${deptName}`,
//             name: `${deptName}`,
//             abbreviation: deptName,
//             hodName: `HOD of ${deptName}`,
//             hodEmail: `hod.${deptName.toLowerCase()}@ldrp.ac.in`,
//             collegeId: college.id,
//           },
//           update: {
//             name: `Department of ${deptName}`,
//             abbreviation: deptName,
//           },
//         });

//         const facultyData = {
//           id: `${row.getCell(4).value?.toString()}`,
//           name: row.getCell(2).value?.toString() || '',
//           email: row.getCell(3).value?.toString() || '',
//           abbreviation: row.getCell(4).value?.toString() || '',
//           designation: 'Assistant Professor',
//           seatingLocation: `${deptName} Department`,
//           departmentId: department.id,
//           joiningDate: new Date(),
//         };

//         const result = await prisma.faculty.upsert({
//           where: { email: facultyData.email },
//           create: facultyData,
//           update: facultyData,
//         });

//         console.log('Faculty created:', result);
//         faculties.push(facultyData);
//       }

//       res.status(200).json({
//         message: 'Faculty data updated successfully',
//         count: faculties.length,
//       });
//     } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({
//         message: 'Error processing faculty data',
//         error: error instanceof Error ? error.message : 'Unknown error',
//       });
//     }
//   }
// );

// router.post( '/subject-data',
//   isAuthenticated,
//   isAdmin,
//   upload.single('subjectData'),
//   async (req: Request, res: Response): Promise<void> => {
//     try {
//       if (!req.file) {
//         res.status(400).json({ message: 'No file uploaded' });
//         return;
//       }

//       const workbook = new ExcelJS.Workbook();
//       await workbook.xlsx.readFile(req.file.path);
//       const worksheet = workbook.getWorksheet(1);

//       if (!worksheet) {
//         res.status(400).json({ message: 'Invalid worksheet' });
//         return;
//       }

//       const subjects: SubjectData[] = [];

//       for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
//         const row = worksheet.getRow(rowNumber);
//         const departmentData = row.getCell(7).value?.toString();
//         const semesterData = row.getCell(5).value?.toString();

//         if (!departmentData || !semesterData) {
//           res.status(400).json({
//             message: 'Invalid department or semester data',
//             row: rowNumber,
//           });
//           return;
//         }

//         const department = await prisma.department.upsert({
//           where: { id: departmentData },
//           create: {
//             id: departmentData,
//             name: `Department of ${departmentData}`,
//             abbreviation: departmentData,
//             hodName: `HOD of ${departmentData}`,
//             hodEmail: `hod.${departmentData.toLowerCase()}@ldrp.ac.in`,
//             collegeId: 'LDRP-ITR',
//           },
//           update: {},
//         });

//         const semester = await prisma.semester.upsert({
//           where: { id: semesterData },
//           create: {
//             id: semesterData,
//             departmentId: department.id,
//             semesterNumber: parseInt(semesterData),
//             academicYear: new Date().getFullYear().toString(),
//           },
//           update: {},
//         });

//         const subjectData: SubjectData = {
//           name: row.getCell(2).value?.toString() || '',
//           abbreviation: row.getCell(3).value?.toString() || '',
//           subjectCode: row.getCell(4).value?.toString() || '',
//           type:
//             row.getCell(6).value?.toString()?.toUpperCase() === 'YES'
//               ? 'ELECTIVE'
//               : 'MANDATORY',
//           departmentId: department.id,
//           semesterId: semester.id,
//         };

//         const result = await prisma.subject.upsert({
//           where: {
//             departmentId_subjectCode: {
//               departmentId: subjectData.departmentId,
//               subjectCode: subjectData.subjectCode,
//             },
//           },
//           create: subjectData,
//           update: subjectData,
//         });

//         subjects.push(subjectData);
//       }

//       // Clean up the uploaded file
//       fs.unlinkSync(req.file.path);

//       res.status(200).json({
//         message: 'Subjects data uploaded successfully',
//         count: subjects.length,
//       });
//     } catch (error) {
//       console.error('Error:', error);
//       res.status(500).json({
//         message: 'Error processing subject data',
//         error: error instanceof Error ? error.message : 'Unknown error',
//       });
//     }
//   }
// );

export default router;
