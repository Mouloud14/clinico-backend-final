import mongoose from "mongoose";

const medicamentSchema = new mongoose.Schema({
  // Nom du médicament
  nomCommercial: {
    type: String,
    required: [true, "Le nom commercial du médicament est requis"],
    unique: true,
    trim: true
  },
  nomScientifique: {
    type: String,
    trim: true
  },
  
  // Dosage
  dosage: {
    type: String,
    required: [true, "Le dosage est requis"],
    trim: true
  },
  
  // Forme pharmaceutique
  forme: {
    type: String,
    required: [true, "La forme pharmaceutique est requise"],
    enum: [
      "Comprimé",
      "Gélule", 
      "Sachet",
      "Sirop",
      "Ampoule",
      "Pommade",
      "Crème",
      "Spray",
      "Suppositoire",
      "Solution injectable",
      "Autre"
    ]
  },
  formeAutre: {
    type: String,
    trim: true
  },
  
  // Voie d'administration
  voie: {
    type: String,
    required: [true, "La voie d'administration est requise"],
    enum: [
      "Orale",
      "Intraveineuse",
      "Intramusculaire",
      "Sous-cutanée",
      "Rectale",
      "Cutanée",
      "Nasale",
      "Oculaire",
      "Autre"
    ]
  },
  
  // Classe thérapeutique
  classeTherapeutique: {
    type: String,
    required: [true, "La classe thérapeutique est requise"],
    trim: true
  },
  
  // Description (optionnel)
  description: {
    type: String,
    trim: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Medicament", medicamentSchema);