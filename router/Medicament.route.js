
import express from "express";
import { 
  addMedicament, 
  getAllMedicaments, 
  getMedicamentById, 
  updateMedicament, 
  deleteMedicament 
} from "../controller/Medicament.controller.js";
// NOUVEL IMPORT
import { isAuthenticated } from "../middlewares/auth.js"; 

const router = express.Router();

// REMPLACER isAdminAuthenticated PAR isAuthenticated POUR TOUTES LES ROUTES
router.post("/add", isAuthenticated, addMedicament);
router.get("/all", isAuthenticated, getAllMedicaments);
router.get("/:id", isAuthenticated, getMedicamentById);
router.put("/:id", isAuthenticated, updateMedicament);
router.delete("/:id", isAuthenticated, deleteMedicament);

export default router;