import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// Get all departments
export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const departments = await prisma.department.findMany();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching departments' });
  }
};

// Create a new department
export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, abbreviation, hodName, hodEmail, collegeId } = req.body;

    const department = await prisma.department.create({
      data: {
        name,
        abbreviation,
        hodName,
        hodEmail,
        collegeId,
      },
    });

    res.json(department);
  } catch (error) {
    res.status(500).json({ error: 'Error creating department' });
  }
};

// Get a specific department by ID
export const getDepartmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      res.status(404).json({ error: 'Department not found' });
      return;
    }

    res.json(department);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching department details' });
  }
};

// Update a specific department by ID
export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, abbreviation, hodName, hodEmail, collegeId } = req.body;

    const department = await prisma.department.update({
      where: { id },
      data: {
        name,
        abbreviation,
        hodName,
        hodEmail,
        collegeId,
      },
    });

    res.json(department);
  } catch (error) {
    res.status(500).json({ error: 'Error updating department details' });
  }
};

// Delete a specific department by ID
export const deleteDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.department.delete({
      where: { id },
    });

    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting department' });
  }
};
