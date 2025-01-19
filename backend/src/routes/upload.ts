import express, { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

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

const router: Router = express.Router();
const prisma: PrismaClient = new PrismaClient();

router.post('/faculty-matrix', async (req: Request, res: Response) => {

  try {
    const processedData: ProcessedData = req.body;

    for (const [collegeName, collegeData] of Object.entries(processedData)) {
      let college = await prisma.college.findFirst({
        where: { name: collegeName },
      });

      if (!college) {
        college = await prisma.college.create({
          data: {
            name: collegeName,
            websiteUrl: `https://www.${collegeName.toLowerCase()}.ac.in`,
            address: 'Gujarat',
            contactNumber: '1234567890',
            logo: `${collegeName.toLowerCase()}_logo.png`,
            images: {},
          },
        });
      }

      for (const [deptName, deptData] of Object.entries(collegeData)) {
        let department = await prisma.department.upsert({
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

        for (const [semesterNum, semData] of Object.entries(deptData)) {
          const semester = await prisma.semester.upsert({
            where: {
              departmentId_semesterNumber: {
                departmentId: department.id,
                semesterNumber: parseInt(semesterNum),
              },
            },
            create: {
              departmentId: department.id,
              semesterNumber: parseInt(semesterNum),
              academicYear: new Date().getFullYear().toString(),
            },
            update: {},
          });

          for (const [divisionName, divData] of Object.entries(semData)) {
            const division = await prisma.division.upsert({
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

            for (const [subjectCode, subjectData] of Object.entries(divData)) {
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
                  }

                  await prisma.subjectAllocation.upsert({
                    where: {
                      facultyId_subjectId_divisionId_semesterId_lectureType: {
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

    res.status(200).json({
      success: true,
      message: 'Faculty matrix processed successfully',
      details: {
        timestamp: new Date().toISOString(),
      },
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
  }
});

export default router;
