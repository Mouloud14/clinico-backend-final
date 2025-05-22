import express from "express";
import { addNewAdmin, getUserDetails, login, logoutAdmin,changePassword } from "../controller/userController.js";

import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);
router.put("/change-password", isAdminAuthenticated, changePassword);


export default router;