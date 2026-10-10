import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import petRoutes from "./routes/petRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import { errorHandler, notFound } from "./middleware/errors.js";

const app = express();
const clientOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || clientOrigins.includes(origin)) {
        return callback(null, true);
      }
      const error = new Error("This website is not allowed to access the API.");
      error.status = 403;
      return callback(error);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "pawfect-home-api" });
});

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
  authRoutes,
);
app.use("/api/pets", petRoutes);
app.use("/api/requests", requestRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
