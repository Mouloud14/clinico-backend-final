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
    
  },
  cabinetPhone: {
    type: String,
    
    minLength: [10, "Numéro de téléphone invalide"],
    maxLength: [10, "Numéro de téléphone invalide"]
  },
  ordreNumber: {
    type: String,
    
    unique: true
  },
  specialite: {
    type: String,
    
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
    enum: ["Admin", "Receptionist"], // Assurez-vous que les rôles sont dans un enum
    default: "Admin"
  },
  docAvatar: {
    public_id: String,
    url: String,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // NOUVEAU CHAMP POUR LIER LA RÉCEPTIONNISTE AU MÉDECIN
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Ne s'applique pas aux administrateurs
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJsonWebToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

export default mongoose.model("User", userSchema);