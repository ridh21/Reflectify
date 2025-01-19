import express from 'express';
import otpRoutes from './routes/otp';
import authRoutes from './routes/oauth';
import adminRoutes from './routes/adminRoute';
import uploadRouter from './routes/upload';
import uploadStaticDataRouter from './routes/uploadstaticdata';
import dashboardRoutes from './routes/dashboard';
import facultyRoutes from './routes/facultyRoutes';
import studentRoutes from './routes/studentRoutes';
import semesterRoutes from './routes/semesterRoutes';
import divisionRoutes from './routes/divisionRoutes';
import collegeRoutes from './routes/collegeRoutes';
import departmentRoutes from './routes/departmentRoutes';
import subjectRoutes  from './routes/subjectRoutes';
import subjectAllocationRoutes from './routes/subjectAllocationRoutes';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/otp', otpRoutes);
app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRouter);
app.use('/api/upload-data', uploadStaticDataRouter);
app.use('/api/dashboard', dashboardRoutes);

// Academic Routes
app.use('/api/faculty', facultyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/divisions', divisionRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/subject-allocation', subjectAllocationRoutes);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
