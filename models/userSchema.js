import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Le prénom est requis"],
    minLength: [3, "Le prénom doit contenir au moins 3 caractères"]
  },
  lastName: {
    type: String,
    required: [true, "Le nom est requis"],
    minLength: [3, "Le nom doit contenir au moins 3 caractères"]
  },
  email: {
    type: String,
    required: [true, "L'email est requis"],
    validate: [validator.isEmail, "Email invalide"],
    unique: true
  },
  cabinetAddress: {
    type: String,
    required: [true, "L'adresse du cabinet est requise"]
  },
  cabinetPhone: {
    type: String,
    required: [true, "Le téléphone du cabinet est requis"],
    minLength: [10, "Numéro de téléphone invalide"],
    maxLength: [10, "Numéro de téléphone invalide"]
  },
  ordreNumber: {
    type: String,
    required: [true, "Le numéro d'ordre est requis"],
    unique: true
  },
  specialite: {
    type: String,
    required: [true, "La spécialité est requise"]
  },
  password: {
    type: String,
    required: [true, "Le mot de passe est requis"],
    minLength: [8, "Le mot de passe doit contenir au moins 8 caractères"],
    select: false
  },
  role: {
    type: String,
    required: true,
    default: "Admin"
  },
  docAvatar: {
    public_id: String,
    url: String,
  }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    console.log("BACKEND LOG (userSchema): Mot de passe non modifié, passer le hachage.");
    next();
    return; // Assurez-vous de return ici
  }
  try {
    console.log("BACKEND LOG (userSchema): Début hachage mot de passe...");
    this.password = await bcrypt.hash(this.password, 10);
    console.log("BACKEND LOG (userSchema): Mot de passe haché (début):", this.password.substring(0, 10), "..."); // Log juste le début
    next();
  } catch (hashError) {
    console.error("BACKEND LOG (userSchema): ERREUR lors du hachage du mot de passe:", hashError.message);
    console.error("BACKEND LOG (userSchema): Détails erreur hachage:", hashError);
    next(new Error("Erreur interne lors du traitement du mot de passe")); // Passer l'erreur au middleware suivant
  }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

export const User = mongoose.model("User", userSchema);
