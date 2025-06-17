// Dans backend/router/userRouter.js

import express from "express"; // Assure-toi que cette ligne est présente !
import { addNewAdmin, getUserDetails, login, logoutAdmin, changePassword } from "../controller/userController.js";
import { isAdminAuthenticated } from "../middlewares/auth.js"; // Assure-toi que cette ligne est présente !

const router = express.Router();

router.post("/login", login);
router.post("/admin/addnew", addNewAdmin);

// ***************************************************************
// LA LIGNE CLÉ POUR CETTE ROUTE
// On appelle d'abord isAdminAuthenticated, PUIS le getUserDetails MODIFIÉ (qui n'est plus encapsulé par catchAsyncErrors)
router.get("/admin/me", isAdminAuthenticated, getUserDetails); // <-- TRÈS IMPORTANT : DOIT être exactement ça
// ***************************************************************

router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);
router.put("/change-password", isAdminAuthenticated, changePassword);

export default router;