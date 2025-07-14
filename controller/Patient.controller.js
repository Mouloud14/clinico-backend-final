import Patient from "../models/Patient.model.js";
import ErrorHandler from "../middlewares/error.js"; // Assurez-vous que ErrorHandler est importé
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js"; 
import { sendEmail } from "../utils/sendEmail.js"; 
import User from "../models/userSchema.js"; 

// Fonction pour ajouter un nouveau patient
export const addNewPatient = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const doctorId = req.user._id; // Récupérer l'ID du médecin connecté
    const {
      patientNumber,
      firstName,
      lastName,
      address,
      dob,
      weight,
      height,
      gender,
      bloodGroup,
      chronicDiseases,
      pastSurgeries,
      phoneNumber,
      email,
      nextAppointment,
    } = req.body;

    // Vérifier si le numéro du patient existe déjà pour ce médecin
    const existingPatient = await Patient.findOne({
      patientNumber,
      doctor: doctorId
    });
    if (existingPatient) {
      return next(new ErrorHandler("Patient number already in use", 400)); // <<< UTILISER next(new ErrorHandler)
    }


    if (email && email.trim() !== "") {
      const existingEmail = await Patient.findOne({
          email: email.toLowerCase(),
          doctor: doctorId
      });
      if (existingEmail) {
          return next(new ErrorHandler("Cet email est déjà utilisé par un autre patient de ce médecin.", 400)); // <<< UTILISER next(new ErrorHandler)
      }
    }

    // Gestion des fichiers médicaux
    const medicalFiles = [];
    if (req.files) {
      const files = req.files.filter(file => file.fieldname === 'medicalFiles');
      for (const file of files) {
        const fileBuffer = file.buffer;
        const base64File = fileBuffer.toString("base64");
        const dataURI = `data:${file.mimetype};base64,${base64File}`;
        medicalFiles.push({
            url: dataURI,
            addedDate: new Date()
        });
      }
    }

    let profileImage = null;
    const profileImageFile = req.files.find(file => file.fieldname === 'profileImage');
    if (profileImageFile) {
        const base64Image = profileImageFile.buffer.toString("base64");
        const dataURI = `data:${profileImageFile.mimetype};base64,${base64Image}`;
        profileImage = {
            url: dataURI,
            addedDate: new Date()
        };
    }

    // Créer un nouveau patient avec le médecin associé
    const newPatient = await Patient.create({
      patientNumber,
      firstName,
      lastName,
      address,
      dob,
      weight,
      height,
      gender,
      bloodGroup,
      chronicDiseases,
      pastSurgeries,
      medicalFiles,
      phoneNumber,
      email,
      profileImage,
      appointments: nextAppointment ? [{ date: new Date(nextAppointment) }] : [],
      doctor: doctorId
    });

    res.status(201).json({ message: "Patient added successfully", patient: newPatient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500)); // <<< UTILISER next(new ErrorHandler)
  }
});

// Fonction pour récupérer tous les patients du médecin
export const getAllPatients = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const patients = await Patient.find(
      { doctor: req.user._id },
      { medicalFiles: 0, __v: 0 }
    ).lean();

    res.status(200).json({ patients });
  } catch (error) {
    next(new ErrorHandler(error.message, 500)); // <<< UTILISER next(new ErrorHandler)
  }
});

export const getPatientsByDate = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const { date } = req.query;

    console.log("--- Début getPatientsByDate ---");
    console.log("Date reçue du frontend:", date);

    const queryDate = new Date(date);

    const startOfDay = new Date(Date.UTC(
        queryDate.getFullYear(),
        queryDate.getMonth(),
        queryDate.getDate(),
        0, 0, 0, 0
    ));

    const endOfDay = new Date(Date.UTC(
        queryDate.getFullYear(),
        queryDate.getMonth(),
        queryDate.getDate() + 1,
        0, 0, 0, 0
    ));

    console.log("Période de recherche UTC (début):", startOfDay.toISOString());
    console.log("Période de recherche UTC (fin):", endOfDay.toISOString());

    const patients = await Patient.find({
      doctor: req.user._id,
      'appointments.date': {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    console.log("Patients trouvés par getPatientsByDate:", patients.length);
    console.log("--- Fin getPatientsByDate ---");

    res.status(200).json({ patients });
  } catch (error) {
    console.error("Erreur dans getPatientsByDate:", error); // Conserver le log pour le débogage
    next(new ErrorHandler(error.message, 500)); // <<< UTILISER next(new ErrorHandler)
  }
});

export const getPatientById = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404)); // <<< UTILISER next(new ErrorHandler)
    }
    res.json(patient);
  } catch (error) {
    next(new ErrorHandler(error.message, 500)); // <<< UTILISER next(new ErrorHandler)
  }
});

export const markPatientAsSeen = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const { id } = req.params;
    const patient = await Patient.findOne({
      _id: id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404)); // <<< UTILISER next(new ErrorHandler)
    }

    patient.seen = !patient.seen;
    await patient.save();

    res.json({ message: "Statut mis à jour", seen: patient.seen });
  } catch (error) {
    console.error("Erreur serveur:", error); // Conserver le log
    next(new ErrorHandler("Erreur serveur", 500)); // <<< UTILISER next(new ErrorHandler)
  }
});

export const addCertificatToPatient = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    patient.certificats.push(req.body);
    await patient.save();

    res.status(200).json({ message: "Certificat ajouté avec succès", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

export const addBilanToPatient = catchAsyncErrors(async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    // Ajouter le champ additionalTests
    patient.bilans.push({
      ...req.body,
      additionalTests: req.body.additionalTests || [] // Récupère les tests supplémentaires
    });
    
    await patient.save();
    res.status(200).json({ message: "Bilan ajouté avec succès", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

// Dans patientController.js, dans la fonction qui gère l'ajout/mise à jour de RDV
export const scheduleAppointment = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  const {
    patientId,
    appointmentDate, 
    emailReminderActive, 
    emailReminderTime,   
    customReminderDate,  
  } = req.body;

  
  const patient = await Patient.findById(patientId); // <<< AJOUTEZ CETTE LIGNE

  if (!patient) {
    return next(new ErrorHandler("Patient non trouvé", 404));
  }

   const newAppointment = {
    date: new Date(appointmentDate), // Assurez-vous que c'est le bon nom de champ pour la date du RDV
    emailReminderSent: false, // Toujours false à la création
    emailReminderSentAt: null,
    emailReminderActive: emailReminderActive, // Sauvegarder l'état
    emailReminderTime: emailReminderTime,     // Sauvegarder l'option
    customReminderDate: customReminderDate ? new Date(customReminderDate) : null, // Sauvegarder la date personnalisée
  };

  patient.appointments.push(newAppointment);
  await patient.save();

    res.status(200).json({
        success: true,
        message: "Rendez-vous programmé avec succès!",
        patient: patient, // Renvoyer le patient mis à jour
        appointmentId: newAppointment._id // <<< VÉRIFIEZ ABSOLUMENT QUE CETTE LIGNE EST LÀ !
    });
});

export const addJustificationToPatient = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    const justification = {
      date: new Date(),
      doctorName: req.body.doctorName,
      doctor: req.body.doctor,
      ...(req.body.justificationText && { justificationText: req.body.justificationText })
    };

    patient.justifications.push(justification);
    await patient.save();

    res.status(200).json({ message: "Justification ajoutée avec succès", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

export const addPrescriptionToPatient = catchAsyncErrors(async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    // Mapper les médicaments pour inclure nomCommercial et dosage
    const medications = req.body.medications.map(med => ({
      medicamentId: med.medicamentId,
      nomCommercial: med.nomCommercial, // Ajouté
      dosage: med.dosage,               // Ajouté
      boxes: med.boxes,
      note: med.note || ''
    }));

    const prescriptionData = {
      ...req.body,
      medications // Utiliser le nouveau tableau
    };

    patient.prescriptions.push(prescriptionData);
    await patient.save();

    res.status(200).json({ message: "Ordonnance ajoutée avec succès", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

export const addMedicalFilesToPatient = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    const medicalFiles = [];
    if (req.files) {
      const files = req.files.filter(file => file.fieldname === 'medicalFiles');
      for (const file of files) {
        const base64File = file.buffer.toString("base64");
        // Dans addMedicalFilesToPatient
        const dataURI = `data:${file.mimetype};base64,${base64File}`; // mimetype doit être 'application/pdf' pour les PDFs
        medicalFiles.push({
            url: dataURI,
            addedDate: new Date()
        });
      }
    }

    patient.medicalFiles.push(...medicalFiles);
    await patient.save();

    res.status(200).json({ message: "Fichiers médicaux ajoutés", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

export const updateAppointmentTime = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const { patientId, appointmentId, newAppointmentDate } = req.body;

    if (!patientId || !appointmentId || !newAppointmentDate) {
      return next(new ErrorHandler("Tous les champs sont requis", 400));
    }

    const patient = await Patient.findOne({
      _id: patientId,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    const appointment = patient.appointments.id(appointmentId);
    if (!appointment) {
      return next(new ErrorHandler("Rendez-vous non trouvé", 404));
    }

    appointment.date = new Date(newAppointmentDate);
    await patient.save();

    res.status(200).json({ message: "Heure du rendez-vous mise à jour", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

export const updatePatientPhoneNumber = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const { id } = req.params;
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return next(new ErrorHandler("Le numéro de téléphone est requis", 400));
    }

    const patient = await Patient.findOne({
      _id: id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    patient.phoneNumber = phoneNumber;
    await patient.save();

    res.status(200).json({ message: "Numéro de téléphone mis à jour avec succès", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});


export const addNoteToPatient = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    const noteData = {
      date: new Date(),
      doctorName: req.body.doctorName,
      doctor: req.body.doctor,
      noteText: req.body.noteText
    };

    patient.notes.push(noteData);
    await patient.save();

    res.status(200).json({ message: "Note ajoutée avec succès", patient });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});

// Ajoutez cette nouvelle fonction dans votre Patient.controller.js

export const updatePatientInfo = catchAsyncErrors(async (req, res, next) => { // <<< AJOUTER catchAsyncErrors et next
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Trouver le patient
    const patient = await Patient.findOne({
      _id: id,
      doctor: req.user._id
    });

    if (!patient) {
      return next(new ErrorHandler("Patient non trouvé", 404));
    }

    // Vérifier si le numéro de patient existe déjà pour un autre patient
    if (updateData.patientNumber && updateData.patientNumber !== patient.patientNumber) {
      const existingPatientNumber = await Patient.findOne({
        patientNumber: updateData.patientNumber,
        doctor: req.user._id,
        _id: { $ne: id }
      });
      if (existingPatientNumber) {
        return next(new ErrorHandler("Ce numéro de patient est déjà utilisé.", 400));
      }
    }

    // Vérifier si l'email existe déjà pour un autre patient
    if (updateData.email && updateData.email !== patient.email) {
      if (updateData.email.trim() !== "") {
        const existingEmail = await Patient.findOne({
          email: updateData.email.toLowerCase(),
          doctor: req.user._id,
          _id: { $ne: id }
        });
        if (existingEmail) {
          return next(new ErrorHandler("Email déjà utilisé par un autre patient.", 400));
        }
      }
    }

    // Gestion des fichiers médicaux (uniquement les nouveaux uploads)
    const medicalFiles = [];
    if (req.files && req.files.length > 0) { // S'assurer que des fichiers ont été envoyés
      const files = req.files.filter(file => file.fieldname === 'medicalFiles');
      for (const file of files) {
        const fileBuffer = file.buffer;
        const base64File = fileBuffer.toString("base64");
        const dataURI = `data:${file.mimetype};base64,${base64File}`;
        medicalFiles.push({
            url: dataURI,
            addedDate: new Date()
        });
      }
    }

    // Gestion de l'image de profil
    let profileImage = patient.profileImage; // Conserver l'ancienne si pas de nouvelle
    const profileImageFile = req.files?.find(file => file.fieldname === 'profileImage');
    if (profileImageFile) {
      const base64Image = profileImageFile.buffer.toString("base64");
      const dataURI = `data:${profileImageFile.mimetype};base64,${base64Image}`;
      profileImage = {
        url: dataURI,
        addedDate: new Date()
      };
    }

    // Mettre à jour les données du patient
    // Utiliser Object.assign ou un loop pour fusionner les champs de updateData dans patient
    for (const key in updateData) {
        if (updateData[key] !== undefined) { // Ne mettre à jour que si la valeur est fournie
            patient[key] = updateData[key];
        }
    }
    
    // Gérer l'ajout des nouveaux medicalFiles
    if (medicalFiles.length > 0) {
        patient.medicalFiles.push(...medicalFiles);
    }
    // Gérer l'update de profileImage
    if (profileImage) {
        patient.profileImage = profileImage;
    }


    await patient.save(); // Sauvegarder les modifications

    res.status(200).json({
      message: "Informations du patient mises à jour avec succès",
      patient: patient // Renvoyer le patient mis à jour
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(new ErrorHandler("Données invalides: " + error.message, 400)); // Plus précis
    }
    next(new ErrorHandler(error.message, 500));
  }
});


export const sendReminderNow = catchAsyncErrors(async (req, res, next) => {
    const { patientId, appointmentId } = req.body; // Récupérer les IDs du patient et du RDV

    if (!patientId || !appointmentId) {
        return next(new ErrorHandler("Les IDs du patient et du rendez-vous sont requis.", 400));
    }

    const patient = await Patient.findById(patientId).populate('doctor', 'firstName lastName');
    if (!patient) {
        return next(new ErrorHandler("Patient non trouvé.", 404));
    }

    const appointment = patient.appointments.id(appointmentId); // Trouver le sous-document RDV
    if (!appointment) {
        return next(new ErrorHandler("Rendez-vous non trouvé.", 404));
    }

    // Vérifier si le rappel n'a pas déjà été envoyé manuellement pour ce RDV
    // On permet de renvoyer si l'option n'était pas 'manual-now' initialement
    if (appointment.emailReminderSent && appointment.emailReminderTime === 'manual-now') {
        return next(new ErrorHandler("Rappel déjà envoyé manuellement pour ce rendez-vous.", 400));
    }

    // Vérifier si l'email du patient est disponible
    if (!patient.email) {
        return next(new ErrorHandler("L'adresse e-mail du patient n'est pas renseignée. Impossible d'envoyer le rappel.", 400));
    }

    const rdvDate = appointment.date.toLocaleDateString('fr-FR');
    const rdvTime = appointment.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const doctorName = patient.doctor ? `Dr. ${patient.doctor.firstName} ${patient.doctor.lastName}` : 'votre médecin';

    const emailSubject = `Rappel Immédiat: Votre rendez-vous médical le ${rdvDate}`;
    const emailMessage = `Bonjour ${patient.firstName} ${patient.lastName},\n\n` +
                        `Ceci est un rappel IMMÉDIAT pour votre rendez-vous avec ${doctorName} le ${rdvDate} à ${rdvTime}.\n\n` +
                        `Merci de vous présenter à l'heure.\n\n` +
                        `Cordialement,\nVotre cabinet médical.`;

    try {
        await sendEmail({ email: patient.email, subject: emailSubject, message: emailMessage });

        // Mettre à jour le statut du rappel pour CE rendez-vous
        appointment.emailReminderSent = true;
        appointment.emailReminderSentAt = new Date();
        appointment.emailReminderTime = 'manual-now'; // Marquer comme envoyé manuellement
        appointment.emailReminderActive = true; // S'assurer qu'il est actif si envoyé manuellement
        await patient.save(); // Sauvegarder le document Patient mis à jour

        res.status(200).json({ success: true, message: "Rappel immédiat envoyé avec succès!" });
    } catch (error) {
        console.error("Erreur lors de l'envoi du rappel immédiat:", error);
        return next(new ErrorHandler("Échec de l'envoi du rappel immédiat.", 500));
    }
});