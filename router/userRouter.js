// Dans backend/router/userRouter.js

import express from "express";
import { addNewAdmin, getUserDetails, login, logoutAdmin, changePassword } from "../controller/userController.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";
// Si tu as importé catchAsyncErrors ici, tu peux le laisser ou le retirer pour ce test.
// import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"; // Décommenter si non utilisé pour le test

const router = express.Router();

router.post("/login", login);
router.post("/admin/addnew", addNewAdmin);

// TEMPORAIREMENT : Pour le test, retire isAdminAuthenticated et catchAsyncErrors pour cette route
// Assure-toi que getUserDetails n'est pas enveloppé par catchAsyncErrors dans userController non plus pour ce test !
// Si getUserDetails dans userController.js est exporté comme export const getUserDetails = catchAsyncErrors(async (...
// Change-le TEMPORAIREMENT en : export const getUserDetails = async (...
router.get("/admin/me", async (req, res) => {
    console.log("TEST ROUTE /admin/me: Appel direct sans middleware d'auth.");
    // Pour ce test, tu pourrais même renvoyer une réponse simple SANS req.user si tu veux être sûr
    return res.status(200).json({ success: true, message: "Test direct reussi!" });
    // Ou si tu veux essayer d'inclure req.user (si déjà mis en place ailleurs)
    // return res.status(200).json({ success: true, user: req.user });
});


router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);
router.put("/change-password", isAdminAuthenticated, changePassword);

export default router;