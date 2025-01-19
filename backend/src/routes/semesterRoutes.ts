import express from 'express';
import {
    getSemesters,
    createSemester,
    getSemesterById,
    updateSemester,
    deleteSemester,
  } from '../controllers/semesterController';

const router = express.Router();

// Semester Routes
router.get('/semesters', getSemesters);
router.post('/semesters/create', createSemester);
router.get('/semesters/:id', getSemesterById);
router.put('/semesters/:id/update', updateSemester);
router.delete('/semesters/:id', deleteSemester);

export default router;