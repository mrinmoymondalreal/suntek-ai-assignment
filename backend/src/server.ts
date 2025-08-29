import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./database/connection";
import routes from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware

const allowedOrigins = [
  "http://localhost:5173", // frontend dev
  process.env.FRONTEND_URL || "",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", routes);
app.get("/", (_req, res) => res.send("Hello World"));

// Error handlers at the end
import { notFound, errorHandler } from "./middleware/error";
app.use(notFound);
app.use(errorHandler);

// Start
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
  });
});
