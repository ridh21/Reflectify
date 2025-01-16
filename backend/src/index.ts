import express from 'express';
import session from 'express-session';
import passport from './config/passport';
import otpRoutes from './routes/otp';
import authRoutes from './routes/oauth';
import uploadRouter from './routes/upload';
import uploadStaticDataRouter from './routes/uploadstaticdata';
// import cleanDatabaseRouter from './routes/cleanDatabase';
import cors from 'cors';

const app = express();

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      '55f3adbba964f65f44c276ca94dd591890d4222079a95f2db9e8ecb22b74a3c8e395386d6b847924425bba3c51b7bce858989e9a2612a1f82d44a0bf459e5701',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      // httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/otp', otpRoutes);
app.use('/auth', authRoutes);
app.use('/api/upload', uploadRouter);
app.use('/api/upload-data', uploadStaticDataRouter);

// app.use('/api/clean-database', cleanDatabaseRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
