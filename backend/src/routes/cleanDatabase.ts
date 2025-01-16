// import express, { Router, Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';

// const router: Router = express.Router();
// const prisma: PrismaClient = new PrismaClient();

// router.delete('/', async (req: Request, res: Response) => {
//   try {
//     // Delete in order of dependencies
//     await prisma.studentResponse.deleteMany({});
//     await prisma.feedbackQuestion.deleteMany({});
//     await prisma.feedbackForm.deleteMany({});
//     await prisma.feedbackAnalytics.deleteMany({});
//     await prisma.subjectAllocation.deleteMany({});
//     await prisma.student.deleteMany({});
//     await prisma.faculty.deleteMany({});
//     await prisma.subject.deleteMany({});
//     await prisma.division.deleteMany({});
//     await prisma.semester.deleteMany({});
//     await prisma.department.deleteMany({});
//     await prisma.college.deleteMany({});
//     await prisma.admin.deleteMany({});
//     await prisma.analyticsView.deleteMany({});
//     await prisma.customReport.deleteMany({});
//     await prisma.questionCategory.deleteMany({});

//     res.status(200).json({
//       message: 'Database cleaned successfully',
//       status: 'success',
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: 'Error cleaning database',
//       error: error instanceof Error ? error.message : 'Unknown error',
//     });
//   } finally {
//     await prisma.$disconnect();
//   }
// });

// export default router;
