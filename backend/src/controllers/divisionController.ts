import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// Get all divisions
export const getDivisions = async (req: Request, res: Response): Promise<void> => {
  try {
    const divisions = await prisma.division.findMany();
    res.json(divisions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching divisions' });
  }
};

// Create a new division
export const createDivision = async (req: Request, res: Response): Promise<void> => {
  try {
    const { departmentId, semesterId, divisionName, studentCount } = req.body;

    const division = await prisma.division.create({
      data: {
        departmentId,
        semesterId,
        divisionName,
        studentCount: parseInt(studentCount, 10),
      },
    });

    res.json(division);
  } catch (error) {
    res.status(500).json({ error: 'Error creating division' });
  }
};

// Get a specific division by ID
export const getDivisionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const division = await prisma.division.findUnique({
      where: { id },
    });

    if (!division) {
      res.status(404).json({ error: 'Division not found' });
      return;
    }

    res.json(division);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching division details' });
  }
};

// Update a specific division by ID
export const updateDivision = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { departmentId, semesterId, divisionName, studentCount } = req.body;

    const division = await prisma.division.update({
      where: { id },
      data: {
        departmentId,
        semesterId,
        divisionName,
        studentCount: parseInt(studentCount, 10),
      },
    });

    res.json(division);
  } catch (error) {
    res.status(500).json({ error: 'Error updating division details' });
  }
};

// Delete a specific division by ID
export const deleteDivision = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.division.delete({
      where: { id },
    });

    res.json({ message: 'Division deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting division' });
  }
};
