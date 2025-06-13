import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { generateToken } from "../utils/jwtToken.js";
import { cookieOptions } from "../utils/jwtToken.js"

export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Veuillez remplir tous les champs", 400));
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  console.log(user);
  
  if (!user) {
    
    return next(new ErrorHandler("Identifiants incorrects", 401));
  }

  const isPasswordMatch = await user.comparePassword(password);
  console.log("Comparaison du mot de passe :", isPasswordMatch);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Identifiants incorrects", 401));
  }

  generateToken(user, "Connexion réussie!", 200, res);
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, cabinetAddress, cabinetPhone, ordreNumber, specialite, password } = req.body;

  const requiredFields = ['firstName', 'lastName', 'email', 'cabinetAddress', 'cabinetPhone', 'ordreNumber', 'specialite', 'password'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    return next(new ErrorHandler(`Champs manquants : ${missingFields.join(', ')}`, 400));
  }

  const existingAdmin = await User.findOne({ email });
  if (existingAdmin) {
    return next(new ErrorHandler("Cet email est déjà utilisé", 400));
  }

  const admin = await User.create({
    firstName,
    lastName,
    email,
    cabinetAddress,
    cabinetPhone,
    ordreNumber,
    specialite,
    password,
    role: "Admin"
  });

  res.status(201).json({
    success: true,
    message: "Nouvel administrateur créé",
    admin
  });
});

// Conserver uniquement les fonctions utiles
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({ success: true, user: req.user });
});

 export const logoutAdmin catchAsyncErrors(async (req, res, next) => {
  res.status(200)
  
    .clearCookie("adminToken", cookieOptions)
    .json({ success: true, message: "Déconnexion réussie" });
});

// Dans userController.js
export const changePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  
  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("Veuillez remplir tous les champs", 400));
  }

  const user = await User.findById(req.user.id).select("+password");
  
  const isPasswordMatch = await user.comparePassword(oldPassword);
  if (!isPasswordMatch) {
    return next(new ErrorHandler("Ancien mot de passe incorrect", 400));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Mot de passe mis à jour avec succès"
  });
});