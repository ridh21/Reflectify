import express from 'express';
import otpRoutes from './routes/otp';
import authRoutes from './routes/oauth';
import adminRoutes from './routes/adminRoute';
import uploadRouter from './routes/upload';
import uploadStaticDataRouter from './routes/uploadstaticdata';
import dashboardRoutes from './routes/dashboard';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/api/otp', otpRoutes);
app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRouter);
app.use('/api/upload-data', uploadStaticDataRouter);
app.use('/api/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
