import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const getSemesters = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const semesters = await prisma.semester.findMany();
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching semesters' });
  }
};

export const createSemester = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { departmentId, semesterNumber, academicYear } = req.body;

    // Validate the input
    if (!departmentId || !semesterNumber || !academicYear) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const semester = await prisma.semester.create({
      data: {
        departmentId,
        semesterNumber,
        academicYear,
      },
    });

    res.json(semester);
  } catch (error) {
    res.status(500).json({ error: 'Error creating semester' });
  }
};

export const getSemesterById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const semester = await prisma.semester.findUnique({ where: { id } });
    if (!semester) {
      res.status(404).json({ error: 'Semester not found' });
      return;
    }
    res.json(semester);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching semester details' });
  }
};

export const updateSemester = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { departmentId, semesterNumber, academicYear } = req.body;

    // Validate the input
    if (!departmentId || !semesterNumber || !academicYear) {
      res.status(400).json({ error: 'Missing required fields' });
    }

    const semester = await prisma.semester.update({
      where: { id },
      data: {
        departmentId,
        semesterNumber,
        academicYear,
      },
    });

    res.json(semester);
  } catch (error) {
    res.status(500).json({ error: 'Error updating semester details' });
  }
};

export const deleteSemester = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if the semester exists before trying to delete
    const semester = await prisma.semester.findUnique({ where: { id } });
    if (!semester) {
      res.status(404).json({ error: 'Semester not found' });
      return;
    }
    await prisma.semester.delete({ where: { id } });
    res.json({ message: 'Semester deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting semester' });
  }
};
