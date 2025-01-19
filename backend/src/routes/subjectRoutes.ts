import express, { Request, Response } from 'express';
import {
  getSubjects,
  createSubject,
  getSubjectById,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController';

const router = express.Router();

// Subject Routes
router.get('/', getSubjects); // List all subjects
router.post('/create', createSubject); // Add a new subject
router.get('/:id', getSubjectById); // Get subject details
router.put('/:id/update', updateSubject); // Update subject details
router.delete('/:id', deleteSubject); // Delete a subject


export default router;
