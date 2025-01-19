import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// Faculty Controllers
export const getFaculties = async (req: Request, res: Response): Promise<void> => {
  try {
    const faculties = await prisma.faculty.findMany();
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching faculties' });
  }
};

export const createFaculty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, abbreviation, email, designation, seatingLocation, image, joiningDate, departmentId } = req.body;

    const faculty = await prisma.faculty.create({
      data: {
        name,
        abbreviation,
        email,
        designation,
        seatingLocation,
        image,
        joiningDate: new Date(joiningDate),
        departmentId,
      },
    });

    res.json(faculty);
  } catch (error) {
    res.status(500).json({ error: 'Error creating faculty' });
  }
};

export const getFacultyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const faculty = await prisma.faculty.findUnique({ where: { id } });
    if (!faculty){
        res.status(404).json({ error: 'Faculty not found' });
        return;
    } 
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching faculty details' });
  }
};

export const updateFaculty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, abbreviation, email, designation, seatingLocation, image, joiningDate, departmentId } = req.body;

    const faculty = await prisma.faculty.update({
      where: { id },
      data: {
        name,
        abbreviation,
        email,
        designation,
        seatingLocation,
        image,
        joiningDate: new Date(joiningDate),
        departmentId,
      },
    });

    res.json(faculty);
  } catch (error) {
    res.status(500).json({ error: 'Error updating faculty details' });
  }
};

export const deleteFaculty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.faculty.delete({ where: { id } });
    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting faculty' });
  }
};

