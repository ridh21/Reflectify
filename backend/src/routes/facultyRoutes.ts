import express from 'express';
import {
  getFaculties,
  createFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty
} from '../controllers/facultyController';

const router = express.Router();

// Faculty Routes
router.get('/', getFaculties);
router.post('/create', createFaculty);
router.get('/:id', getFacultyById);
router.put('/:id/update', updateFaculty);
router.delete('/:id', deleteFaculty);

export default router;
