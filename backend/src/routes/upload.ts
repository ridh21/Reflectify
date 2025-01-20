import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router: Router = express.Router();
const prisma: PrismaClient = new PrismaClient();

const collegeCache = new Map();
const departmentCache = new Map();
const semesterCache = new Map();
const divisionCache = new Map();
const subjectCache = new Map();
const facultyCache = new Map();

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

interface AllocationBatchItem {
  facultyId: string;
  subjectId: string;
  divisionId: string;
  semesterId: string;
  lectureType: 'LECTURE' | 'LAB';
  academicYear: string;
}

router.post('/faculty-matrix', async (req: Request, res: Response) => {
  const batchSize = 50;
  let allocationBatch: AllocationBatchItem[] = [];
  const currentYear = new Date().getFullYear().toString();

  try {
    const processedData: ProcessedData = req.body;

    for (const [collegeName, collegeData] of Object.entries(processedData)) {
      let college = collegeCache.get(collegeName);
      if (!college) {
        college = await prisma.college.upsert({
          where: { id: 'LDRP-ITR' },
          create: {
            id: 'LDRP-ITR',
            name: 'LDRP Institute of Technology and Research',
            websiteUrl: 'https://www.ldrp.ac.in',
            address: 'Gujarat',
            contactNumber: '1234567890',
            logo: 'ldrp_logo.png',
            images: {},
          },
          update: {},
        });
        collegeCache.set(collegeName, college);
      }

      for (const [deptName, deptData] of Object.entries(collegeData)) {
        const deptKey = `${collegeName}_${deptName}`;
        let department = departmentCache.get(deptKey);
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
          departmentCache.set(deptKey, department);
        }

        await Promise.all(
          Object.entries(deptData).map(async ([semesterNum, semData]) => {
            const semKey = `${deptKey}_${semesterNum}_${currentYear}`;
            let semester = semesterCache.get(semKey);
            if (!semester) {
              semester = await prisma.semester.upsert({
                where: {
                  departmentId_semesterNumber: {
                    departmentId: department.id,
                    semesterNumber: parseInt(semesterNum),
                  },
                },
                create: {
                  departmentId: department.id,
                  semesterNumber: parseInt(semesterNum),
                  academicYear: currentYear,
                },
                update: {
                  academicYear: currentYear,
                },
              });
              semesterCache.set(semKey, semester);
            }

            await Promise.all(
              Object.entries(semData).map(async ([divisionName, divData]) => {
                const divKey = `${deptKey}_${divisionName}_${semester.id}`;
                let division = divisionCache.get(divKey);

                if (!division) {
                  division = await prisma.division.upsert({
                    where: {
                      departmentId_divisionName_semesterId: {
                        departmentId: department.id,
                        divisionName: divisionName,
                        semesterId: semester.id,
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
                  divisionCache.set(divKey, division);
                }

                for (const [subjectCode, subjectData] of Object.entries(
                  divData
                )) {
                  const subjectKey = `${deptKey}_${subjectCode}`;
                  let subject = subjectCache.get(subjectKey);
                  if (!subject) {
                    subject = await prisma.subject.upsert({
                      where: {
                        departmentId_abbreviation: {
                          departmentId: department.id,
                          abbreviation: subjectCode,
                        },
                      },
                      create: {
                        name: subjectCode,
                        abbreviation: subjectCode,
                        subjectCode: subjectCode,
                        departmentId: department.id,
                        semesterId: semester.id,
                        type: 'MANDATORY',
                      },
                      update: {},
                    });
                    subjectCache.set(subjectKey, subject);
                  }

                  if (subjectData.lectures?.designated_faculty) {
                    const facultyKey = subjectData.lectures.designated_faculty;
                    let faculty = facultyCache.get(facultyKey);

                    if (!faculty) {
                      const facultyEmail = `${facultyKey.toLowerCase()}_ce@ldrp.ac.in`;
                      faculty = await prisma.faculty.upsert({
                        where: { abbreviation: facultyKey },
                        create: {
                          name: facultyKey,
                          abbreviation: facultyKey,
                          email: facultyEmail,
                          designation: 'Assistant Professor',
                          seatingLocation: `${department.name} Department`,
                          joiningDate: new Date(),
                          departmentId: department.id,
                        },
                        update: {},
                      });
                      facultyCache.set(facultyKey, faculty);
                    }

                    allocationBatch.push({
                      facultyId: faculty.id,
                      subjectId: subject.id,
                      divisionId: division.id,
                      semesterId: semester.id,
                      lectureType: 'LECTURE',
                      academicYear: currentYear,
                    });
                  }

                  if (subjectData.labs) {
                    for (const [batch, labData] of Object.entries(
                      subjectData.labs
                    )) {
                      const labFacultyKey = labData.designated_faculty;
                      let labFaculty = facultyCache.get(labFacultyKey);

                      if (!labFaculty) {
                        const labFacultyEmail = `${labFacultyKey.toLowerCase()}_ce@ldrp.ac.in`;
                        labFaculty = await prisma.faculty.upsert({
                          where: { abbreviation: labFacultyKey },
                          create: {
                            name: labFacultyKey,
                            abbreviation: labFacultyKey,
                            email: labFacultyEmail,
                            designation: 'Assistant Professor',
                            seatingLocation: `${department.name} Department`,
                            joiningDate: new Date(),
                            departmentId: department.id,
                          },
                          update: {},
                        });
                        facultyCache.set(labFacultyKey, labFaculty);
                      }

                      allocationBatch.push({
                        facultyId: labFaculty.id,
                        subjectId: subject.id,
                        divisionId: division.id,
                        semesterId: semester.id,
                        lectureType: 'LAB',
                        academicYear: currentYear,
                      });
                    }
                  }

                  if (allocationBatch.length >= batchSize) {
                    const validAllocations = allocationBatch.filter(
                      (a) =>
                        a.facultyId &&
                        a.subjectId &&
                        a.divisionId &&
                        a.semesterId
                    );
                    if (validAllocations.length > 0) {
                      await prisma.subjectAllocation.createMany({
                        data: validAllocations,
                        skipDuplicates: true,
                      });
                    }
                    allocationBatch = [];
                  }
                }
              })
            );
          })
        );
      }
    }

    if (allocationBatch.length > 0) {
      const validAllocations = allocationBatch.filter(
        (a) => a.facultyId && a.subjectId && a.divisionId && a.semesterId
      );
      if (validAllocations.length > 0) {
        await prisma.subjectAllocation.createMany({
          data: validAllocations,
          skipDuplicates: true,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Faculty matrix processed successfully',
      details: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process faculty matrix',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        errorType: error instanceof Error ? error.name : 'Unknown',
        timestamp: new Date().toISOString(),
      },
    });
  } finally {
    collegeCache.clear();
    departmentCache.clear();
    semesterCache.clear();
    divisionCache.clear();
    subjectCache.clear();
    facultyCache.clear();
  }
});

export default router;
