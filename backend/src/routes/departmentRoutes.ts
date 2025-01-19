import express from 'express';
import {
    getDepartments,
    createDepartment,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    } from '../controllers/departmentController';

const router = express.Router();

// Department Routes
router.get('/departments', getDepartments);
router.post('/departments/create', createDepartment);
router.get('/departments/:id', getDepartmentById);
router.put('/departments/:id/update', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

export default router;