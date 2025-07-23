// Dans backend/router/userRouter.js
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
  getAllReceptionists,
  deleteReceptionist,
} from "../controller/userController.js";
import { isAuthenticated } from "../middlewares/auth.js"; 

const router = express.Router();

router.post("/login", login);
router.post("/admin/addnew", isAuthenticated, addNewAdmin);
router.get("/admin/me", isAuthenticated, getUserDetails);
router.get("/admin/logout", isAuthenticated, logoutAdmin);
router.put("/change-password", isAuthenticated, changePassword);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

router.post("/receptionist/addnew", isAuthenticated, addNewReceptionist);
router.get("/receptionists/all", isAuthenticated, getAllReceptionists);
router.delete("/receptionist/delete/:id", isAuthenticated, deleteReceptionist);

export default router;