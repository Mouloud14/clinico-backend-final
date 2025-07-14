import Medicament from "../models/Medicament.model.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";

// Ajouter un médicament
export const addMedicament = catchAsyncErrors(async (req, res, next) => {
  const { 
    nomCommercial, 
    nomScientifique, 
    dosage, 
    forme, 
    formeAutre, 
    voie, 
    classeTherapeutique, 
    description 
  } = req.body;

  // Validation des champs requis
  if (!nomCommercial || !dosage || !forme || !voie || !classeTherapeutique) {
    return next(new ErrorHandler("Les champs nom commercial, dosage, forme, voie d'administration et classe thérapeutique sont requis", 400));
  }

  // Vérifier si le médicament existe déjà
  const existingMedicament = await Medicament.findOne({ nomCommercial });
  if (existingMedicament) {
    return next(new ErrorHandler("Ce médicament existe déjà", 400));
  }

  // Validation pour forme "Autre"
  if (forme === "Autre" && !formeAutre) {
    return next(new ErrorHandler("Veuillez spécifier la forme pharmaceutique", 400));
  }

  const medicamentData = {
    nomCommercial,
    dosage,
    forme,
    voie,
    classeTherapeutique,
    description
  };

  // Ajouter les champs optionnels s'ils sont fournis
  if (nomScientifique) {
    medicamentData.nomScientifique = nomScientifique;
  }

  if (forme === "Autre" && formeAutre) {
    medicamentData.formeAutre = formeAutre;
  }

  const medicament = await Medicament.create(medicamentData);

  res.status(201).json({
    success: true,
    message: "Médicament ajouté avec succès",
    medicament
  });
});

// Récupérer tous les médicaments
export const getAllMedicaments = catchAsyncErrors(async (req, res, next) => {
  const medicaments = await Medicament.find().sort({ nomCommercial: 1 });
  res.status(200).json({
    success: true,
    medicaments
  });
});