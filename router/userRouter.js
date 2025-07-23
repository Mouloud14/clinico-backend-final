import express from "express";
import { 
  addNewAdmin, 
  getUserDetails, 
  login, 
  logoutAdmin,
  changePassword,
  forgotPassword, 
  resetPassword,
  addNewReceptionist, // N'oubliez pas d'importer la nouvelle fonction
} from "../controller/userController.js";


import { isAdminAuthenticated } from "../middlewares/auth.js";
import { isAuthenticated } from "../middlewares/auth.js";


const router = express.Router();

router.post("/login", login);
router.post("/admin/addnew", addNewAdmin); // <<< CORRIGÉ : AUCUN MIDDLEWARE ICI
router.get("/admin/me", isAuthenticated, getUserDetails); // <<< CORRIGÉ : UTILISER isAuthenticated
router.get("/admin/logout", isAuthenticated, logoutAdmin); // <<< CORRIGÉ : UTILISER isAuthenticated
router.put("/change-password", isAuthenticated, changePassword); // <<< CORRIGÉ : UTILISER isAuthenticated

// AJOUT DE LA NOUVELLE ROUTE POUR LA RÉCEPTIONNISTE
router.post("/receptionist/addnew", isAuthenticated, addNewReceptionist); 

// Routes de réinitialisation de mot de passe
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);


export default router;