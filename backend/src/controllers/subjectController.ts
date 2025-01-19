import { PrismaClient, Subject } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const getSubjects = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const subjects = await prisma.subject.findMany();
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching subjects' });
  }
};

export const createSubject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { departmentId, semesterId, name, abbreviation, subjectCode, type } =
      req.body;

    // Validate the input
    if (!departmentId || !semesterId || !name || !subjectCode) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const subject = await prisma.subject.create({
      data: {
        departmentId,
        semesterId,
        name,
        abbreviation,
        subjectCode,
        type,
      },
    });

    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Error creating subject' });
  }
};

export const getSubjectById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching subject details' });
  }
};

export const updateSubject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { departmentId, semesterId, name, abbreviation, subjectCode, type } =
      req.body;

    // Validate the input
    if (!departmentId || !semesterId || !name || !subjectCode) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        departmentId,
        semesterId,
        name,
        abbreviation,
        subjectCode,
        type,
      },
    });

    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: 'Error updating subject details' });
  }
};

export const deleteSubject = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if the subject exists before trying to delete
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    await prisma.subject.delete({ where: { id } });
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting subject' });
  }
};
