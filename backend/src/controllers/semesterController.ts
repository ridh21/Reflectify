import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSemesters = async (req, res) => {
    try {
      const semesters = await prisma.semester.findMany();
      res.json(semesters);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching semesters' });
    }
  };
  
  export const createSemester = async (req, res) => {
    try {
      const { name } = req.body;
      const semester = await prisma.semester.create({
        data: { name },
      });
      res.json(semester);
    } catch (error) {
      res.status(500).json({ error: 'Error creating semester' });
    }
  };
  
  export const getSemesterById = async (req, res) => {
    try {
      const { id } = req.params;
      const semester = await prisma.semester.findUnique({ where: { id: Number(id) } });
      if (!semester) return res.status(404).json({ error: 'Semester not found' });
      res.json(semester);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching semester details' });
    }
  };
  
  export const updateSemester = async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const semester = await prisma.semester.update({
        where: { id: Number(id) },
        data: { name },
      });
      res.json(semester);
    } catch (error) {
      res.status(500).json({ error: 'Error updating semester details' });
    }
  };
  
  export const deleteSemester = async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.semester.delete({ where: { id: Number(id) } });
      res.json({ message: 'Semester deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting semester' });
    }
  };
  