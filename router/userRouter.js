// Dans backend/router/userRouter.js

import express from "express";
import { addNewAdmin, getUserDetails, login, logoutAdmin, changePassword } from "../controller/userController.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";
// Si tu as importé catchAsyncErrors ici, tu peux le laisser ou le retirer pour ce test.
// import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"; // Décommenter si non utilisé pour le test

const router = express.Router();

router.post("/login", login);
router.post("/admin/addnew", addNewAdmin);

// *******************************************************************
// C'EST CETTE LIGNE CI QUI DOIT ÊTRE MODIFIÉE TEMPORAIREMENT POUR LE TEST
// REMPLACEZ LA LIGNE router.get("/admin/me", isAdminAuthenticated, getUserDetails);
// PAR CELLE-CI POUR LE TEST :
router.get("/admin/me", async (req, res) => { // NOTEZ : PAS DE isAdminAuthenticated NI catchAsyncErrors
    console.log("TEST ROUTE /admin/me: Appel direct SANS middleware d'auth."); // CE LOG EST LA CLÉ
    return res.status(200).json({ success: true, message: "Test direct reussi!" });
});
// *******************************************************************

router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);
router.put("/change-password", isAdminAuthenticated, changePassword);

export default router;