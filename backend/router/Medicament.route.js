import express from "express";
import { addMedicament, getAllMedicaments } from "../controller/Medicament.controller.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/add", isAdminAuthenticated, addMedicament);
router.get("/all", isAdminAuthenticated, getAllMedicaments);

export default router;