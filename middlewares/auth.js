// Dans backend/middlewares/auth.js

import jwt from "jsonwebtoken";
import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js"; // Assure-toi que c'est importé
import ErrorHandler from "./error.js"; // Assure-toi que c'est importé

export const isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
    console.log("MIDDLEWARE AUTH: Début de isAdminAuthenticated."); // Ajoute cette ligne
    const token = req.cookies.adminToken;
    console.log("MIDDLEWARE AUTH: Token reçu:", token ? "Oui, token présent" : "Non, token absent"); // Ajoute cette ligne

    if (!token) {
        console.error("MIDDLEWARE AUTH: Erreur - Token manquant."); // Ajoute cette ligne
        return next(new ErrorHandler("Utilisateur non authentifié", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log("MIDDLEWARE AUTH: Token décodé. User ID:", decoded.id); // Ajoute cette ligne
        req.user = await User.findById(decoded.id);
        if (!req.user) {
            console.error("MIDDLEWARE AUTH: Erreur - Utilisateur non trouvé."); // Ajoute cette ligne
            return next(new ErrorHandler("Utilisateur non trouvé", 404));
        }
        console.log("MIDDLEWARE AUTH: Utilisateur trouvé:", req.user.email); // Ajoute cette ligne
        next(); // Permet de passer à la fonction suivante (getUserDetails)
        console.log("MIDDLEWARE AUTH: Fin de isAdminAuthenticated."); // Ajoute cette ligne

    } catch (error) {
        console.error("MIDDLEWARE AUTH: Erreur de vérification du token:", error.message); // Ajoute cette ligne
        return next(new ErrorHandler("Erreur d'authentification.", 401));
    }
});