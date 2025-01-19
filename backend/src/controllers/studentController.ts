import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

// Student Controllers
export const getStudents = async (req: Request, res: Response): Promise<void> => {
    try {
      const students = await prisma.student.findMany();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching students' });
    }
  };
  
  export const createStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        name,
        enrollmentNumber,
        departmentId,
        semesterId,
        divisionId,
        batch,
        email,
        image,
        phoneNumber,
        academicYear,
      } = req.body;
  
      const student = await prisma.student.create({
        data: {
          name,
          enrollmentNumber,
          departmentId,
          semesterId,
          divisionId,
          batch,
          email,
          image,
          phoneNumber,
          academicYear,
        },
      });
  
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: 'Error creating student' });
    }
  };
  
  export const getStudentById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
  
      const student = await prisma.student.findUnique({ where: { id } });
      if (!student){
        res.status(404).json({ error: 'Student not found' });
        return;
      } 
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching student details' });
    }
  };
  
  export const updateStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const {
        name,
        enrollmentNumber,
        departmentId,
        semesterId,
        divisionId,
        batch,
        email,
        image,
        phoneNumber,
        academicYear,
      } = req.body;
  
      const student = await prisma.student.update({
        where: { id },
        data: {
          name,
          enrollmentNumber,
          departmentId,
          semesterId,
          divisionId,
          batch,
          email,
          image,
          phoneNumber,
          academicYear,
        },
      });
  
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: 'Error updating student details' });
    }
  };
  
  export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
  
      await prisma.student.delete({ where: { id } });
      res.json({ message: 'Student deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting student' });
    }
  };
  