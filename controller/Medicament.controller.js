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

// Récupérer un médicament par ID
export const getMedicamentById = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  const medicament = await Medicament.findById(id);
  if (!medicament) {
    return next(new ErrorHandler("Médicament non trouvé", 404));
  }
  
  res.status(200).json({
    success: true,
    medicament
  });
});

// Mettre à jour un médicament
export const updateMedicament = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
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

  // Vérifier si le médicament existe
  const medicament = await Medicament.findById(id);
  if (!medicament) {
    return next(new ErrorHandler("Médicament non trouvé", 404));
  }

  // Vérifier si le nom commercial existe déjà (sauf pour le médicament actuel)
  const existingMedicament = await Medicament.findOne({ 
    nomCommercial, 
    _id: { $ne: id } 
  });
  if (existingMedicament) {
    return next(new ErrorHandler("Ce nom commercial existe déjà", 400));
  }

  // Validation pour forme "Autre"
  if (forme === "Autre" && !formeAutre) {
    return next(new ErrorHandler("Veuillez spécifier la forme pharmaceutique", 400));
  }

  const updateData = {
    nomCommercial,
    dosage,
    forme,
    voie,
    classeTherapeutique,
    description
  };

  // Ajouter les champs optionnels s'ils sont fournis
  if (nomScientifique) {
    updateData.nomScientifique = nomScientifique;
  }

  if (forme === "Autre" && formeAutre) {
    updateData.formeAutre = formeAutre;
  } else if (forme !== "Autre") {
    updateData.formeAutre = undefined;
  }

  const updatedMedicament = await Medicament.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Médicament mis à jour avec succès",
    medicament: updatedMedicament
  });
});

// Supprimer un médicament
export const deleteMedicament = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  
  const medicament = await Medicament.findById(id);
  if (!medicament) {
    return next(new ErrorHandler("Médicament non trouvé", 404));
  }
  
  await Medicament.findByIdAndDelete(id);
  
  res.status(200).json({
    success: true,
    message: "Médicament supprimé avec succès"
  });
});