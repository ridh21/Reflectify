import express, { Router, Request, Response } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import { v4 as uuidv4 } from 'uuid';

const router: Router = express.Router();
const prisma: PrismaClient = new PrismaClient();

const departmentCache = new Map();
const collegeCache = new Map();
const studentCache = new Map();
const subjectCache = new Map();
const semesterCache = new Map();
const divisionCache = new Map();

enum SubjectType {
  MANDATORY = 'MANDATORY',
  ELECTIVE = 'ELECTIVE',
}

interface StudentCreateInput {
  id: string;
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

interface SubjectCreateInput {
  id: string;
  name: string;
  abbreviation: string;
  subjectCode: string;
  type: SubjectType;
  departmentId: string;
  semesterId: string;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  '/faculty-data',
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

      const getCellValue = (cell: ExcelJS.Cell): string => {
        const value = cell.value;
        if (
          value &&
          typeof value === 'object' &&
          'hyperlink' in value &&
          'text' in value
        ) {
          return value.text || '';
        }
        return value?.toString() || '';
      };

      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const collegeName = row.getCell(6).value?.toString() || '';
        const deptName = row.getCell(5).value?.toString() || '';

        let college = collegeCache.get(collegeName);
        if (!college) {
          college = await prisma.college.upsert({
            where: { name: collegeName },
            create: {
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
            where: {
              name_collegeId: {
                name: deptName,
                collegeId: college.id,
              },
            },
            create: {
              name: deptName,
              abbreviation: deptName,
              hodName: `HOD of ${deptName}`,
              hodEmail: `hod.${deptName.toLowerCase()}@ldrp.ac.in`,
              collegeId: college.id,
            },
            update: {},
          });
          departmentCache.set(deptName, department);
        }

        const facultyData = {
          name: getCellValue(row.getCell(2)),
          email: getCellValue(row.getCell(3)),
          abbreviation: getCellValue(row.getCell(4)),
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

router.post(
  '/student-data',
  upload.single('studentData'),
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
      let batch: StudentCreateInput[] = [];
      const processedRows: StudentCreateInput[] = [];

      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const deptName = row.getCell(4).value?.toString() || '';
        const semesterNumber = row.getCell(5).value?.toString() || '';
        const divisionName = row.getCell(6).value?.toString() || '';

        let department = departmentCache.get(deptName);
        if (!department) {
          department = await prisma.department.upsert({
            where: {
              name_collegeId: {
                name: deptName,
                collegeId: 'LDRP-ITR',
              },
            },
            create: {
              name: deptName,
              abbreviation: deptName,
              hodName: `HOD of ${deptName}`,
              hodEmail: `hod.${deptName.toLowerCase()}@ldrp.ac.in`,
              collegeId: 'LDRP-ITR',
            },
            update: {},
          });
          departmentCache.set(deptName, department);
        }

        const semesterKey = `${department.id}_${semesterNumber}`;
        let semester = semesterCache.get(semesterKey);
        if (!semester) {
          semester = await prisma.semester.upsert({
            where: {
              departmentId_semesterNumber: {
                departmentId: department.id,
                semesterNumber: parseInt(semesterNumber),
              },
            },
            create: {
              departmentId: department.id,
              semesterNumber: parseInt(semesterNumber),
              academicYear: new Date().getFullYear().toString(),
            },
            update: {},
          });
          semesterCache.set(semesterKey, semester);
        }

        const divisionKey = `${department.id}_${divisionName}`;
        let division = divisionCache.get(divisionKey);
        if (!division) {
          division = await prisma.division.upsert({
            where: {
              departmentId_divisionName: {
                departmentId: department.id,
                divisionName: divisionName,
              },
            },
            create: {
              departmentId: department.id,
              semesterId: semester.id,
              divisionName: divisionName,
              studentCount: 0,
            },
            update: {},
          });
          divisionCache.set(divisionKey, division);
        }

        const studentData: StudentCreateInput = {
          id: uuidv4(),
          name: row.getCell(2).value?.toString() || '',
          enrollmentNumber: row.getCell(3).value?.toString() || '',
          email: row.getCell(7).value?.toString() || '',
          phoneNumber: row.getCell(8).value?.toString() || '',
          academicYear: new Date().getFullYear().toString(),
          batch: row.getCell(9).value?.toString() || '',
          departmentId: department.id,
          semesterId: semester.id,
          divisionId: division.id,
        };

        batch.push(studentData);
        processedRows.push(studentData);

        if (batch.length >= batchSize || rowNumber === worksheet.rowCount) {
          await prisma.student.createMany({
            data: batch,
            skipDuplicates: true,
          });
          batch = [];
        }
      }

      res.status(200).json({
        message: 'Student data updated successfully',
        count: processedRows.length,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        message: 'Error processing student data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      departmentCache.clear();
      semesterCache.clear();
      divisionCache.clear();
    }
  }
);

router.post(
  '/subject-data',
  upload.single('subjectData'),
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
      let batch: SubjectCreateInput[] = [];
      const processedRows: SubjectCreateInput[] = [];

      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const deptName = row.getCell(7).value?.toString() || '';
        const semesterNumber = row.getCell(5).value?.toString() || '';

        let department = departmentCache.get(deptName);
        if (!department) {
          department = await prisma.department.upsert({
            where: {
              name_collegeId: {
                name: deptName,
                collegeId: 'LDRP-ITR',
              },
            },
            create: {
              name: deptName,
              abbreviation: deptName,
              hodName: `HOD of ${deptName}`,
              hodEmail: `hod.${deptName.toLowerCase()}@ldrp.ac.in`,
              collegeId: 'LDRP-ITR',
            },
            update: {},
          });
          departmentCache.set(deptName, department);
        }

        const semesterKey = `${department.id}_${semesterNumber}`;
        let semester = semesterCache.get(semesterKey);
        if (!semester) {
          semester = await prisma.semester.upsert({
            where: {
              departmentId_semesterNumber: {
                departmentId: department.id,
                semesterNumber: parseInt(semesterNumber),
              },
            },
            create: {
              departmentId: department.id,
              semesterNumber: parseInt(semesterNumber),
              academicYear: new Date().getFullYear().toString(),
            },
            update: {},
          });
          semesterCache.set(semesterKey, semester);
        }

        const subjectData: SubjectCreateInput = {
          id: uuidv4(),
          name: row.getCell(2).value?.toString() || '',
          abbreviation: row.getCell(3).value?.toString() || '',
          subjectCode: row.getCell(4).value?.toString() || '',
          type:
            row.getCell(6).value?.toString()?.toUpperCase() === 'TRUE'
              ? SubjectType.ELECTIVE
              : SubjectType.MANDATORY,
          departmentId: department.id,
          semesterId: semester.id,
        };

        batch.push(subjectData);
        processedRows.push(subjectData);

        if (batch.length >= batchSize || rowNumber === worksheet.rowCount) {
          await prisma.subject.createMany({
            data: batch,
            skipDuplicates: true,
          });
          batch = [];
        }
      }

      res.status(200).json({
        message: 'Subject data updated successfully',
        count: processedRows.length,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        message: 'Error processing subject data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      departmentCache.clear();
      semesterCache.clear();
    }
  }
);

export default router;
