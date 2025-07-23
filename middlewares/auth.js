import User from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

// Middleware d'authentification général
export const isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.token; // OU adminToken selon le cas
  if (!token) {
    return next(new ErrorHandler("Authentification requise", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);
  next();
});

// Middleware d'authentification pour les administrateurs
export const isAdminAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.adminToken;
  if (!token) {
    return next(new ErrorHandler("Authentification requise", 401));
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decoded.id);
  if (!req.user || req.user.role !== "Admin") { // Vérifie si l'utilisateur existe et est bien un Admin
      return next(new ErrorHandler("Accès non autorisé. Seuls les administrateurs peuvent accéder à cette ressource.", 403));
  }
  next();
});

export const isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ErrorHandler("Accès non autorisé", 403));
    }
    next();
  };
};