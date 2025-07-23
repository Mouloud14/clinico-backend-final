import express from "express";
import { 
  addNewAdmin, 
  getUserDetails, 
  login, 
  logoutAdmin,
  changePassword,
  forgotPassword, 
  resetPassword,
  addNewReceptionist,
} from "../controller/userController.js";

import { isAuthenticated, isAdminAuthenticated } from "../middlewares/auth.js";
import { isAuthorized } from "../middlewares/auth.js"; // J'ai ajouté l'import de isAuthorized au cas où tu en aurais besoin

const router = express.Router();

router.post("/login", login);
router.post("/admin/addnew", addNewAdmin);
router.get("/admin/me", isAuthenticated, getUserDetails);
router.get("/admin/logout", isAuthenticated, logoutAdmin);
router.put("/change-password", isAuthenticated, changePassword);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Route pour ajouter une réceptionniste (protégée)
router.post("/receptionist/addnew", isAdminAuthenticated, addNewReceptionist);

export default router;