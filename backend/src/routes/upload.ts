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
  console.log(
    'Received faculty matrix data:',
    JSON.stringify(req.body, null, 2)
  );

  try {
    const processedData: ProcessedData = req.body;

    for (const [collegeName, collegeData] of Object.entries(processedData)) {
      let college = await prisma.college.findFirst({
        where: { name: collegeName },
      });

      if (!college) {
        college = await prisma.college.create({
          data: {
            id: uuidv4(),
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
        let department = await prisma.department.findFirst({
          where: { name: deptName },
        });

        if (!department) {
          department = await prisma.department.create({
            data: {
              id: uuidv4(),
              name: deptName,
              abbreviation: deptName,
              hodName: `HOD of ${deptName}`,
              hodEmail: `hod.${deptName.toLowerCase()}@ldrp.ac.in`,
              collegeId: college.id,
            },
          });
        }

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

            for (const [subjectCode, subjectData] of Object.entries(divData)) {
              let subject = await prisma.subject.findFirst({
                where: { abbreviation: subjectCode },
              });

              if (!subject) {
                subject = await prisma.subject.create({
                  data: {
                    id: uuidv4(),
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
                      id: uuidv4(),
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
                        id: uuidv4(),
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

// import express, { Router, Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
// import { v4 as uuidv4 } from 'uuid';

// interface ProcessedData {
//     [college: string]: {
//         [department: string]: {
//             [semester: string]: {
//                 [division: string]: {
//                     [subject: string]: {
//                         lectures: { designated_faculty: string };
//                         labs?: { [batch: string]: { designated_faculty: string } };
//                     };
//                 };
//             };
//         };
//     };
// }

// const router: Router = express.Router();
// const prisma: PrismaClient = new PrismaClient();

// router.post('/faculty-matrix', async (req: Request, res: Response) => {
//     console.log("Received faculty matrix data:", JSON.stringify(req.body, null, 2));

//     try {
//         const processedData: ProcessedData = req.body;

//         for (const [collegeName, collegeData] of Object.entries(processedData)) {
//             const college = await prisma.college.upsert({
//                 where: { name: collegeName },
//                 create: {
//                     id: collegeName,
//                     name: collegeName,
//                     websiteUrl: `https://www.${collegeName.toLowerCase()}.ac.in`,
//                     address: 'Gujarat',
//                     contactNumber: '1234567890',
//                     logo: `${collegeName.toLowerCase()}_logo.png`,
//                     images: {},
//                 },
//                 update: {},
//             });

//             for (const [deptName, deptData] of Object.entries(collegeData)) {
//                 const department = await prisma.department.upsert({
//                     where: { name: deptName },
//                     create: {
//                         id: deptName,
//                         name: deptName,
//                         abbreviation: deptName,
//                         hodName: `HOD of ${deptName}`,
//                         hodEmail: `hod.${deptName.toLowerCase()}@ldrp.ac.in`,
//                         collegeId: college.id,
//                     },
//                     update: {},
//                 });

//                 for (const [semesterNum, semData] of Object.entries(deptData)) {
//                     const semester = await prisma.semester.upsert({
//                         where: { id: semesterNum },
//                         create: {
//                             id: semesterNum,
//                             departmentId: department.id,
//                             semesterNumber: parseInt(semesterNum),
//                             academicYear: new Date().getFullYear().toString(),
//                         },
//                         update: {},
//                     });

//                     for (const [divisionName, divData] of Object.entries(semData)) {
//                         const division = await prisma.division.upsert({
//                             where: { id: divisionName },
//                             create: {
//                                 id: divisionName,
//                                 departmentId: department.id,
//                                 semesterId: semester.id,
//                                 divisionName: divisionName,
//                                 studentCount: 0,
//                             },
//                             update: {},
//                         });

//                         for (const [subjectCode, subjectData] of Object.entries(divData)) {
//                             let subject = await prisma.subject.findFirst({
//                                 where: { abbreviation: subjectCode },
//                             });

//                             if (!subject) {
//                                 subject = await prisma.subject.create({
//                                     data: {
//                                         id: uuidv4(),
//                                         name: subjectCode,
//                                         abbreviation: subjectCode,
//                                         subjectCode: subjectCode,
//                                         departmentId: department.id,
//                                         semesterId: semester.id,
//                                     },
//                                 });
//                             }

//                             if (subjectData.lectures?.designated_faculty) {
//                                 let faculty = await prisma.faculty.findFirst({
//                                     where: { abbreviation: subjectData.lectures.designated_faculty },
//                                 });

//                                 if (!faculty) {
//                                     faculty = await prisma.faculty.create({
//                                         data: {
//                                             id: uuidv4(),
//                                             name: subjectData.lectures.designated_faculty,
//                                             abbreviation: subjectData.lectures.designated_faculty,
//                                             email: `${subjectData.lectures.designated_faculty.toLowerCase()}@ldrp.ac.in`,
//                                             designation: 'Assistant Professor',
//                                             seatingLocation: `${department.id} Department`,
//                                             joiningDate: new Date(),
//                                             departmentId: department.id,
//                                         },
//                                     });
//                                 }

//                                 await prisma.subjectAllocation.upsert({
//                                     where: {
//                                         facultyId_subjectId_divisionId_semesterId_lectureType: {
//                                             facultyId: faculty.id,
//                                             subjectId: subject.id,
//                                             divisionId: division.id,
//                                             semesterId: semester.id,
//                                             lectureType: 'LECTURE',
//                                         }
//                                     },
//                                     create: {
//                                         facultyId: faculty.id,
//                                         subjectId: subject.id,
//                                         divisionId: division.id,
//                                         semesterId: semester.id,
//                                         lectureType: 'LECTURE',
//                                         academicYear: new Date().getFullYear().toString(),
//                                     },
//                                     update: {},
//                                 });
//                             }

//                             if (subjectData.labs) {
//                                 for (const [batch, labData] of Object.entries(subjectData.labs)) {
//                                     let labFaculty = await prisma.faculty.findFirst({
//                                         where: { abbreviation: labData.designated_faculty },
//                                     });

//                                     if (!labFaculty) {
//                                         labFaculty = await prisma.faculty.create({
//                                             data: {
//                                                 id: uuidv4(),
//                                                 name: labData.designated_faculty,
//                                                 abbreviation: labData.designated_faculty,
//                                                 email: `${labData.designated_faculty.toLowerCase()}@ldrp.ac.in`,
//                                                 designation: 'Assistant Professor',
//                                                 seatingLocation: `${department.id} Department`,
//                                                 joiningDate: new Date(),
//                                                 departmentId: department.id,
//                                             },
//                                         });
//                                     }

//                                     await prisma.subjectAllocation.upsert({
//                                         where: {
//                                             facultyId_subjectId_divisionId_semesterId_lectureType: {
//                                                 facultyId: labFaculty.id,
//                                                 subjectId: subject.id,
//                                                 divisionId: division.id,
//                                                 semesterId: semester.id,
//                                                 lectureType: 'LAB',
//                                             }
//                                         },
//                                         create: {
//                                             facultyId: labFaculty.id,
//                                             subjectId: subject.id,
//                                             divisionId: division.id,
//                                             semesterId: semester.id,
//                                             lectureType: 'LAB',
//                                             academicYear: new Date().getFullYear().toString(),
//                                         },
//                                         update: {},
//                                     });
//                                 }
//                             }
//                         }
//                     }
//                 }
//             }
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Faculty matrix processed successfully',
//             details: {
//                 timestamp: new Date().toISOString()
//             }
//         });

//     } catch (error) {
//         console.error("Processing error:", error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to process faculty matrix',
//             error: error instanceof Error ? error.message : 'Unknown error',
//             details: {
//                 errorType: error instanceof Error ? error.name : 'Unknown',
//                 timestamp: new Date().toISOString()
//             }
//         });
//     }
// });

// export default router;

// // import express, { Router, Request, Response } from 'express';
// // import multer, { Multer, StorageEngine } from 'multer';
// // import { PrismaClient } from '@prisma/client';
// // import fs from 'fs';
// // import FormData from 'form-data';
// // import fetch from 'node-fetch';
// // import { v4 as uuidv4 } from 'uuid';

// // const router: Router = express.Router();
// // const prisma: PrismaClient = new PrismaClient();

// // // Type Definitions
// // interface ProcessedData {
// //   [college: string]: {
// //       [department: string]: {
// //           [semester: string]: {
// //               [division: string]: {
// //                   [subject: string]: {
// //                       lectures: { designated_faculty: string };
// //                       labs?: { [batch: string]: { designated_faculty: string } };
// //                   };
// //               };
// //           };
// //       };
// //   };
// // }

// // // Loop Variables
// // const [collegeName, collegeData] = Object.entries(processedData);
// // const [deptName, deptData] = Object.entries(collegeData);
// // const [semesterNum, semData] = Object.entries(deptData);
// // const [divisionName, divData] = Object.entries(semData);
// // const [subjectCode, subjectData] = Object.entries(divData);
// // const [batch, labData] = Object.entries(subjectData.labs);

// // // Database Records
// // const college = await prisma.college.upsert();
// // const department = await prisma.department.upsert();
// // const semester = await prisma.semester.upsert();
// // const division = await prisma.division.upsert();
// // const subject = await prisma.subject.upsert();
// // const faculty = await prisma.faculty.upsert();
// // const labFaculty = await prisma.faculty.upsert();

// // // Response Variables
// // const success = true/false;
// // const message = string;
// // const details = { timestamp: Date, errorType?: string };

// // const storage: StorageEngine = multer.diskStorage({
// //   destination: (req, file, cb) => {
// //     cb(null, './uploads');
// //   },
// //   filename: (req, file, cb) => {
// //     cb(null, `${Date.now()}-${file.originalname}`);
// //   },
// // });

// // const fileFilter = (
// //   req: Request,
// //   file: Express.Multer.File,
// //   cb: multer.FileFilterCallback
// // ) => {
// //   const allowedMimes = [
// //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
// //     'application/vnd.ms-excel',
// //     'application/octet-stream',
// //   ];
// //   if (allowedMimes.includes(file.mimetype)) {
// //     cb(null, true);
// //   } else {
// //     cb(null, false);
// //   }
// // };

// // const upload: Multer = multer({
// //   storage: storage,
// //   fileFilter: fileFilter,
// //   limits: { fileSize: 5 * 1024 * 1024 },
// // });

// // // router.post(
// // //   '/faculty-matrix',
// // //   async (req: Request, res: Response): Promise<void> => {
// // //     try {
// // //       // Log received data
// // //       console.log(
// // //         'Received faculty matrix data:',
// // //         JSON.stringify(req.body, null, 2)
// // //       );

// // //       const processedData = req.body as ProcessedData;

// // //       for (const [collegeName, collegeData] of Object.entries(processedData)) {
// // //         const college = await prisma.college.upsert({
// // //           where: { id: uuidv4() },
// // //           create: {
// // //             id: uuidv4(),
// // //             name: collegeName,
// // //             websiteUrl: `https://www.${collegeName.toLowerCase()}.ac.in`,
// // //             address: 'Gujarat',
// // //             contactNumber: '1234567890',
// // //             logo: `${collegeName.toLowerCase()}_logo.png`,
// // //             images: {},
// // //           },
// // //           update: {},
// // //         });

// // //         for (const [deptName, deptData] of Object.entries(collegeData)) {
// // //           const department = await prisma.department.upsert({
// // //             where: { id: deptName },
// // //             create: {
// // //               id: deptName,
// // //               name: deptName,
// // //               abbreviation: deptName,
// // //               hodName: '',
// // //               hodEmail: '',
// // //               collegeId: college.id,
// // //             },
// // //             update: {},
// // //           });

// // //           for (const [semesterNum, semData] of Object.entries(deptData)) {
// // //             const semester = await prisma.semester.upsert({
// // //               where: { id: semesterNum },
// // //               create: {
// // //                 id: semesterNum,
// // //                 departmentId: department.id,
// // //                 semesterNumber: parseInt(semesterNum),
// // //                 academicYear: new Date().getFullYear().toString(),
// // //               },
// // //               update: {},
// // //             });

// // //             for (const [divisionName, divData] of Object.entries(semData)) {
// // //               const division = await prisma.division.upsert({
// // //                 where: { id: divisionName },
// // //                 create: {
// // //                   id: divisionName,
// // //                   departmentId: department.id,
// // //                   semesterId: semester.id,
// // //                   divisionName: divisionName,
// // //                   studentCount: 0,
// // //                 },
// // //                 update: {},
// // //               });

// // //               for (const [subjectCode, subjectData] of Object.entries(
// // //                 divData
// // //               )) {
// // //                 let subject = await prisma.subject.findFirst({
// // //                   where: { abbreviation: subjectCode },
// // //                 });

// // //                 if (!subject) {
// // //                   subject = await prisma.subject.create({
// // //                     data: {
// // //                       name: subjectCode,
// // //                       abbreviation: subjectCode,
// // //                       subjectCode: subjectCode,
// // //                       departmentId: department.id,
// // //                       semesterId: semester.id,
// // //                     },
// // //                   });
// // //                 }

// // //                 if (subjectData.lectures?.designated_faculty) {
// // //                   let faculty = await prisma.faculty.findFirst({
// // //                     where: {
// // //                       abbreviation: subjectData.lectures.designated_faculty,
// // //                     },
// // //                   });

// // //                   if (!faculty) {
// // //                     faculty = await prisma.faculty.create({
// // //                       data: {
// // //                         name: subjectData.lectures.designated_faculty,
// // //                         abbreviation: subjectData.lectures.designated_faculty,
// // //                         email: `${subjectData.lectures.designated_faculty.toLowerCase()}@ldrp.ac.in`,
// // //                         designation: 'Assistant Professor',
// // //                         seatingLocation: `${department.id} Department`,
// // //                         joiningDate: new Date(),
// // //                         departmentId: department.id,
// // //                       },
// // //                     });
// // //                     console.log(`✓ Created faculty: ${faculty.name}`);
// // //                   }

// // //                   await prisma.subjectAllocation.upsert({
// // //                     where: {
// // //                       facultyId_subjectId_divisionId_semesterId_lectureType: {
// // //                         facultyId: faculty.id,
// // //                         subjectId: subject.id,
// // //                         divisionId: division.id,
// // //                         semesterId: semester.id,
// // //                         lectureType: 'LECTURE',
// // //                       },
// // //                     },
// // //                     create: {
// // //                       facultyId: faculty.id,
// // //                       subjectId: subject.id,
// // //                       divisionId: division.id,
// // //                       semesterId: semester.id,
// // //                       lectureType: 'LECTURE',
// // //                       academicYear: new Date().getFullYear().toString(),
// // //                     },
// // //                     update: {},
// // //                   });
// // //                 }

// // //                 if (subjectData.labs) {
// // //                   for (const [batch, labData] of Object.entries(
// // //                     subjectData.labs
// // //                   )) {
// // //                     if (labData.designated_faculty) {
// // //                       let labFaculty = await prisma.faculty.findFirst({
// // //                         where: { abbreviation: labData.designated_faculty },
// // //                       });

// // //                       if (!labFaculty) {
// // //                         labFaculty = await prisma.faculty.create({
// // //                           data: {
// // //                             name: labData.designated_faculty,
// // //                             abbreviation: labData.designated_faculty,
// // //                             email: `${labData.designated_faculty.toLowerCase()}@ldrp.ac.in`,
// // //                             designation: 'Assistant Professor',
// // //                             seatingLocation: `${department.id} Department`,
// // //                             joiningDate: new Date(),
// // //                             departmentId: department.id,
// // //                           },
// // //                         });
// // //                         console.log(
// // //                           `✓ Created lab faculty: ${labFaculty.name}`
// // //                         );
// // //                       }

// // //                       await prisma.subjectAllocation.upsert({
// // //                         where: {
// // //                           facultyId_subjectId_divisionId_semesterId_lectureType:
// // //                             {
// // //                               facultyId: labFaculty.id,
// // //                               subjectId: subject.id,
// // //                               divisionId: division.id,
// // //                               semesterId: semester.id,
// // //                               lectureType: 'LAB',
// // //                             },
// // //                         },
// // //                         create: {
// // //                           facultyId: labFaculty.id,
// // //                           subjectId: subject.id,
// // //                           divisionId: division.id,
// // //                           semesterId: semester.id,
// // //                           lectureType: 'LAB',
// // //                           academicYear: new Date().getFullYear().toString(),
// // //                         },
// // //                         update: {},
// // //                       });
// // //                     }
// // //                   }
// // //                 }
// // //               }
// // //             }
// // //           }
// // //         }
// // //       }

// // //       res.status(200).json({
// // //         success: true,
// // //         message: 'Faculty matrix processed successfully',
// // //         details: {
// // //           timestamp: new Date().toISOString(),
// // //         },
// // //       });
// // //     } catch (error) {
// // //       console.error('Error processing faculty matrix:', error);
// // //       res.status(500).json({
// // //         success: false,
// // //         message: 'Failed to process faculty matrix',
// // //         error: error instanceof Error ? error.message : 'Unknown error',
// // //         details: {
// // //           errorType: error instanceof Error ? error.name : 'Unknown',
// // //           timestamp: new Date().toISOString(),
// // //         },
// // //       });
// // //     }
// // //   }
// // // );

// // export default router;
