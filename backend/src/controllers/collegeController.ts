import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// Get all colleges
export const getColleges = async (req: Request, res: Response): Promise<void> => {
  try {
    const colleges = await prisma.college.findMany();
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching colleges' });
  }
};

// Create a new college
export const createCollege = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, websiteUrl, address, contactNumber, logo, images } = req.body;

    const college = await prisma.college.create({
      data: {
        name,
        websiteUrl,
        address,
        contactNumber,
        logo,
        images,
      },
    });

    res.json(college);
  } catch (error) {
    res.status(500).json({ error: 'Error creating college' });
  }
};

// Get a specific college by ID
export const getCollegeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const college = await prisma.college.findUnique({
      where: { id },
    });

    if (!college) {
      res.status(404).json({ error: 'College not found' });
      return;
    }

    res.json(college);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching college details' });
  }
};

// Update a specific college by ID
export const updateCollege = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, websiteUrl, address, contactNumber, logo, images } = req.body;

    const college = await prisma.college.update({
      where: { id },
      data: {
        name,
        websiteUrl,
        address,
        contactNumber,
        logo,
        images,
      },
    });

    res.json(college);
  } catch (error) {
    res.status(500).json({ error: 'Error updating college details' });
  }
};

// Delete a specific college by ID
export const deleteCollege = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.college.delete({
      where: { id },
    });

    res.json({ message: 'College deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting college' });
  }
};
