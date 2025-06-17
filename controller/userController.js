import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { generateToken } from "../utils/jwtToken.js";


export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Veuillez remplir tous les champs", 400));
  }

  console.time("LOGIN_PROCESS_TIME"); // <<< DEBUT DU TIMER

  console.time("DB_FETCH_USER_TIME"); // <<< Timer pour la recherche utilisateur
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  console.timeEnd("DB_FETCH_USER_TIME"); // <<< FIN Timer recherche utilisateur

  if (!user) {
    return next(new ErrorHandler("Identifiants incorrects", 401));
  }

  console.time("PASSWORD_COMPARE_TIME"); // <<< Timer pour la comparaison du mot de passe
  const isPasswordMatch = await user.comparePassword(password);
  console.timeEnd("PASSWORD_COMPARE_TIME"); // <<< FIN Timer comparaison mot de passe

  if (!isPasswordMatch) {
    return next(new ErrorHandler("Identifiants incorrects", 401));
  }

  // La génération du token est généralement rapide
  generateToken(user, "Connexion réussie!", 200, res);

  console.timeEnd("LOGIN_PROCESS_TIME"); // <<< FIN DU TIMER GLOBAL
});

export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, cabinetAddress, cabinetPhone, ordreNumber, specialite, password } = req.body;

  console.log("BACKEND LOG (addNewAdmin): Données reçues:", req.body); // Log toutes les données

  const requiredFields = ['firstName', 'lastName', 'email', 'cabinetAddress', 'cabinetPhone', 'ordreNumber', 'specialite', 'password'];
  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    console.error("BACKEND LOG (addNewAdmin): ERREUR - Champs manquants:", missingFields.join(', '));
    return next(new ErrorHandler(`Champs manquants : ${missingFields.join(', ')}`, 400));
  }

  console.log("BACKEND LOG (addNewAdmin): Vérification email et ordreNumber uniques...");
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    console.error("BACKEND LOG (addNewAdmin): ERREUR - Email déjà utilisé:", email);
    return next(new ErrorHandler("Cet email est déjà utilisé", 400));
  }
  const existingOrder = await User.findOne({ ordreNumber }); // Vérifiez aussi ordreNumber si unique
  if (existingOrder) {
    console.error("BACKEND LOG (addNewAdmin): ERREUR - Numéro d'ordre déjà utilisé:", ordreNumber);
    return next(new ErrorHandler("Ce numéro d'ordre est déjà utilisé", 400));
  }


  try {
      console.log("BACKEND LOG (addNewAdmin): Tentative de création de l'utilisateur...");
      const admin = await User.create({ // <<< C'EST ICI OU L'ERREUR PEUT SE PRODUIRE
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
      console.log("BACKEND LOG (addNewAdmin): Utilisateur créé avec succès:", admin.email);

      res.status(201).json({
        success: true,
        message: "Nouvel administrateur créé",
        admin
      });
  } catch (error) {
      console.error("BACKEND LOG (addNewAdmin): ERREUR DANS LE CATCH. Nom de l'erreur:", error.name);
      console.error("BACKEND LOG (addNewAdmin): Message de l'erreur:", error.message);
      console.error("BACKEND LOG (addNewAdmin): Erreur complète:", error);

      if (error.name === 'ValidationError') {
          const errors = Object.keys(error.errors).map(key => error.errors[key].message);
          return next(new ErrorHandler(`Erreur de validation: ${errors.join(', ')}`, 400));
      }
      // Pour toute autre erreur inattendue (y compris les problèmes de DB si non validés)
      return next(new ErrorHandler("Erreur interne du serveur", 500));
  }
});
// Conserver uniquement les fonctions utiles
export const getUserDetails = async (req, res, next) => { // ATTENTION: async (req, res, next) et non catchAsyncErrors(async (...)
    console.log("CONTROLLER: Début de getUserDetails. (Version test)"); // CE LOG EST LA CLÉ AUSSI
    res.status(200).json({ success: true, user: req.user });
    console.log("CONTROLLER: Fin de getUserDetails, réponse envoyée. (Version test)"); // CE LOG EST LA CLÉ AUSSI
};

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