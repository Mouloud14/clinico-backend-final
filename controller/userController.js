import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { generateToken } from "../utils/jwtToken.js";


export const login = catchAsyncErrors(async (req, res, next) => {
  console.log("BACKEND LOGIN LOG: --- DÉBUT TENTATIVE DE CONNEXION ---"); // <<< NOUVEAU LOG
  const { email, password } = req.body;

  console.log("BACKEND LOGIN LOG: Email reçu:", email); // <<< NOUVEAU LOG
  console.log("BACKEND LOGIN LOG: Mot de passe reçu (masqué):", password ? "[Reçu]" : "[Manquant]"); // <<< NOUVEAU LOG

  if (!email || !password) {
    console.error("BACKEND LOGIN LOG: ERREUR - Email ou mot de passe manquant dans la requête."); // <<< NOUVEAU LOG
    return next(new ErrorHandler("Veuillez remplir tous les champs", 400));
  }

  console.log("BACKEND LOGIN LOG: Recherche utilisateur par email:", email); // <<< NOUVEAU LOG
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    console.error("BACKEND LOGIN LOG: ERREUR - Utilisateur non trouvé pour l'email:", email); // <<< NOUVEAU LOG
    return next(new ErrorHandler("Identifiants incorrects", 401));
  }
  console.log("BACKEND LOGIN LOG: Utilisateur trouvé dans DB:", user.email, "ID:", user._id); // <<< NOUVEAU LOG

  console.log("BACKEND LOGIN LOG: Début comparaison mot de passe..."); // <<< NOUVEAU LOG
  const isPasswordMatch = await user.comparePassword(password);
  console.log("BACKEND LOGIN LOG: Résultat comparaison mot de passe:", isPasswordMatch ? "Correspond" : "Ne Correspond PAS"); // <<< NOUVEAU LOG

  if (!isPasswordMatch) {
    console.error("BACKEND LOGIN LOG: ERREUR - Mot de passe incorrect pour l'utilisateur:", user.email); // <<< NOUVEAU LOG
    return next(new ErrorHandler("Identifiants incorrects", 401));
  }
  console.log("BACKEND LOGIN LOG: Mot de passe vérifié, connexion réussie."); // <<< NOUVEAU LOG

  generateToken(user, "Connexion réussie!", 200, res);
  console.log("BACKEND LOGIN LOG: Token généré et cookie envoyé."); // <<< NOUVEAU LOG
  console.log("BACKEND LOGIN LOG: --- FIN TENTATIVE DE CONNEXION ---"); // <<< NOUVEAU LOG
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
  const user = req.user;
  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;
  console.log("BACKEND LOG (getUserDetails): User object sent to frontend:", userWithoutPassword); // <<< Log pour vérif
  res.status(200).json({ success: true, user: userWithoutPassword });
});

 export const logoutAdmin = catchAsyncErrors(async (req, res, next) => { 
   res.status(200)
    .clearCookie("adminToken", { // <<< Cette ligne doit avoir les options ici
       secure: true,
       sameSite: 'none',
    })
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
