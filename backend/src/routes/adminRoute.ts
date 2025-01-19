import express, { Router, Request, Response } from 'express';
import { createAdmin, loginAdmin, createSuperAdmin } from '../controllers/adminController';
import { isAuthenticated, isSuperAdmin } from '../middleware/auth';

const router: Router = express.Router();

// Define route handler types
type RequestHandler = (req: Request, res: Response) => Promise<void>;

// router.post('/signup', 
//   isAuthenticated,
//   isSuperAdmin,
//   async (req: Request, res: Response): Promise<void> => {
//     await createAdmin(req, res);
//   }
// );

router.post('/login', 
  async (req: Request, res: Response): Promise<void> => {
    await loginAdmin(req, res);
  }
);

// router.post('/super/signup', 
//   async (req: Request, res: Response): Promise<void> => {
//     await createSuperAdmin(req, res);
//   }
// );

export default router;
