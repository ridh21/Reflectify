import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import config from "./config/config";

// Initialize dotenv
dotenv.config();

const app = express();

// Middlewares
app.use(bodyParser.json());
dotenv.config();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Imported Routes

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Backend APIs",
    creator: "Harsh Dodiya",
    LinkedIn: config.linkedIn || "Harsh Dodiya",
    GitHub: config.github || "Harsh Dodiya",
  });
});


// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
