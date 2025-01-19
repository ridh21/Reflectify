import express from 'express';
import {
    getColleges,
    createCollege,
    getCollegeById,
    updateCollege,
    deleteCollege,
  } from '../controllers/collegeController';

const router = express.Router();

  // College Routes
router.get('/colleges', getColleges);
router.post('/colleges/create', createCollege);
router.get('/colleges/:id', getCollegeById);
router.put('/colleges/:id/update', updateCollege);
router.delete('/colleges/:id', deleteCollege);

export default router;