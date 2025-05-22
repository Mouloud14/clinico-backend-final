import express from "express";
import { dbConnection } from "./database/dbConnection.js";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./router/userRouter.js";
import patientRouter from "./router/Patient.route.js";



const app = express();
config({ path: "./config.env" });

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL].filter(Boolean),
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.use("/api/v1/user", userRouter);
app.use("/api/v1/patient", patientRouter);



dbConnection();

app.use(errorMiddleware);
export default app;