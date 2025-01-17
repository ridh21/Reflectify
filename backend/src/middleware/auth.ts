import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      User?: {
        id: string;
        email: string;
        isSuper: boolean;
      }
    }
  }
}

interface JwtPayload {
  id: string;
  email: string;
  isSuper: boolean;
}

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.User = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
    return;
  }
};

export const isSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.User?.isSuper) {
    res.status(403).json({ message: 'Super admin access required' });
    return;
  }
  next();
};
