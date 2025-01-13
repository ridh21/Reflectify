import { Router, RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendOtpEmail } from '../services/emailService';

interface ErrorResponse {
  message: string;
  code?: string;
}

const router = Router();
const prisma = new PrismaClient();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendOtpHandler: RequestHandler = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const otp = generateOTP();

  try {
    await prisma.oTP.create({
      data: {
        email: email,
        otp: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendOtpEmail(email, otp);
    res.json({ message: 'OTP sent successfully' });
  } catch (error: unknown) {
    const errorResponse = error as ErrorResponse;
    console.error('OTP Error:', errorResponse);
    res.status(500).json({
      error: 'Failed to send OTP',
      details: errorResponse.message,
    });
  }
};

const verifyOtpHandler: RequestHandler = async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ error: 'Email and OTP are required' });
    return;
  }

  try {
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        otp,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      res.status(400).json({ error: 'Invalid or expired OTP' });
      return;
    }

    await prisma.oTP.delete({
      where: { id: otpRecord.id },
    });

    res.json({ message: 'OTP verified successfully' });
  } catch (error: unknown) {
    const errorResponse = error as ErrorResponse;
    console.error('Verification Error:', errorResponse);
    res.status(500).json({
      error: 'Failed to verify OTP',
      details: errorResponse.message,
    });
  }
};

router.post('/send-otp', sendOtpHandler);
router.post('/verify-otp', verifyOtpHandler);

export default router;
