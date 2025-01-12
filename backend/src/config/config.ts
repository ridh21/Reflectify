require("dotenv").config();

const config = {
  port: process.env.PORT,
  cors_origin1: process.env.CORS_ORIGIN1,
  cors_origin2: process.env.CORS_ORIGIN2,
  dbURL: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  linkedIn: process.env.LINKEDIN,
  github: process.env.GITHUB,
};

export default config;