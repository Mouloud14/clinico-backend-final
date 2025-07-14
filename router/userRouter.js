import express from "express";
import { addNewAdmin, getUserDetails, login, logoutAdmin,changePassword,forgotPassword, resetPassword } from "../controller/userController.js";


import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/admin/addnew", addNewAdmin); // <<< Assurez-vous que c'est bien ça pour l'instant
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);
router.put("/change-password", isAdminAuthenticated, changePassword);

// Ajouter dans les routes existantes
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);


export default router;
