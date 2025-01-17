import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password, designation } = req.body;

    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        designation,
        isSuper: false
      }
    });

    const adminWithoutPassword = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      designation: admin.designation,
      isSuper: admin.isSuper
    };

    return res.status(201).json(adminWithoutPassword);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating admin', error });
  }
};

export const createSuperAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password, designation } = req.body;

    const existingSuperAdmin = await prisma.admin.findFirst({
      where: { isSuper: true }
    });

    if (existingSuperAdmin) {
      return res.status(400).json({ message: 'Super Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedPassword,
        designation,
        isSuper: true
      }
    });

    const adminWithoutPassword = {
      id: superAdmin.id,
      name: superAdmin.name,
      email: superAdmin.email,
      designation: superAdmin.designation,
      isSuper: superAdmin.isSuper
    };

    return res.status(201).json(adminWithoutPassword);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating super admin', error });
  }
};

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email, 
        isSuper: admin.isSuper 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        designation: admin.designation,
        isSuper: admin.isSuper
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in', error });
  }
};
