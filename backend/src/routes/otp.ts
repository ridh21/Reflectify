import { Router } from 'express';
const router = Router();

// Commenting out OTP functionality for future implementation
/*
const sendOtpHandler: RequestHandler = async (req, res) => {
  // OTP sending logic
};

const verifyOtpHandler: RequestHandler = async (req, res) => {
  // OTP verification logic
};

router.post('/send-otp', sendOtpHandler);
router.post('/verify-otp', verifyOtpHandler);
*/

export default router;
