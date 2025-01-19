import express from 'express';
import {
    getDivisions,
    createDivision,
    getDivisionById,
    updateDivision,
    deleteDivision,
  } from '../controllers/divisionController';

const router = express.Router();

router.get('/divisions', getDivisions);
router.post('/divisions/create', createDivision);
router.get('/divisions/:id', getDivisionById);
router.put('/divisions/:id/update', updateDivision);
router.delete('/divisions/:id', deleteDivision);

export default router;