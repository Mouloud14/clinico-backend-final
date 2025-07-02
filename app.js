import 'dotenv/config'; 
console.log("APP.JS LOG: Application démarrant...");
import express from "express";
import { dbConnection } from "./database/dbConnection.js";

import cookieParser from "cookie-parser";
import cors from "cors";

import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./router/userRouter.js";
import patientRouter from "./router/Patient.route.js";


const app = express(); 
console.log("CORS Origin configured as:", process.env.DASHBOARD_URL);


app.use(
  cors({
    origin: [
      "https://medoclic-frontend.vercel.app/login", // L'URL de production principale de votre frontend Vercel
      "http://localhost:5173"                  // <<< CECI DOIT ABSOLUMENT ÊTRE LÀ ET CORRECT
    ],
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// ... le reste du code reste inchangé

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.use("/api/v1/user", userRouter);
app.use("/api/v1/patient", patientRouter);

dbConnection();

app.use(errorMiddleware);
export default app;
