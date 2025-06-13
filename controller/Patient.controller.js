import { Patient } from "../models/Patient.model.js";

// Fonction pour ajouter un nouveau patient
export const addNewPatient = async (req, res) => {
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
      return res.status(400).json({ message: "Patient number already in use" });
    }

  


if (email && email.trim() !== "") { // Assurez-vous que l'email n'est pas vide ou juste des espaces
    const existingEmail = await Patient.findOne({
        email: email.toLowerCase(), 
        doctor: doctorId
    });
    if (existingEmail) {
        return res.status(400).json({ message: "Cet email est déjà utilisé par un autre patient de ce médecin." });
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
      doctor: doctorId // Ajout du médecin
    });

    res.status(201).json({ message: "Patient added successfully", patient: newPatient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fonction pour récupérer tous les patients du médecin
export const getAllPatients = async (req, res) => {
  try {
    // Version optimisée avec projection et lean()
    const patients = await Patient.find(
      { doctor: req.user._id },
      { medicalFiles: 0, __v: 0 } // Exclusion des données lourdes
    ).lean(); 
    
    res.status(200).json({ patients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const patients = await Patient.find({
      doctor: req.user._id,
      'appointments.date': {
        $gte: startDate,
        $lt: endDate
      }
    });

    res.status(200).json({ patients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });
    
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markPatientAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findOne({
      _id: id,
      doctor: req.user._id
    });
    
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    patient.seen = !patient.seen;
    await patient.save();

    res.json({ message: "Statut mis à jour", seen: patient.seen });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

export const addCertificatToPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });
    
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    patient.certificats.push(req.body);
    await patient.save();

    res.status(200).json({ message: "Certificat ajouté avec succès", patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 

export const addBilanToPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });
    
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    patient.bilans.push(req.body);
    await patient.save();

    res.status(200).json({ message: "Bilan ajouté avec succès", patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const scheduleAppointment = async (req, res) => {
  try {
    const { patientId, appointmentDate } = req.body;

    if (!patientId || !appointmentDate) {
      return res.status(400).json({ message: "Patient et date requis" });
    }

    const patient = await Patient.findOne({
      _id: patientId,
      doctor: req.user._id
    });
    
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    const now = new Date();
    const appointmentDateTime = new Date(appointmentDate);

    if (appointmentDateTime < now) {
      return res.status(400).json({ message: "Vous ne pouvez pas programmer un rendez-vous dans le passé." });
    }

    if (appointmentDateTime.toDateString() === now.toDateString() && appointmentDateTime < now) {
      return res.status(400).json({ message: "Vous ne pouvez pas programmer un rendez-vous à une heure passée aujourd'hui." });
    }

    const existingAppointmentOnSameDay = patient.appointments.some(appt => {
      const apptDate = new Date(appt.date);
      return apptDate.toDateString() === appointmentDateTime.toDateString();
    });

    if (existingAppointmentOnSameDay) {
      return res.status(400).json({ message: "Le patient a déjà un rendez-vous programmé pour cette journée." });
    }

    patient.appointments.push({ date: appointmentDateTime });
    await patient.save();

    res.status(200).json({ message: "Rendez-vous programmé", patient });
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la programmation du rendez-vous", 
      error: error.message 
    });
  }
};

export const addJustificationToPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });
    
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
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
    res.status(500).json({ message: error.message });
  }
};

export const addPrescriptionToPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });
    
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    const prescriptionData = {
      ...req.body,
      medications: req.body.medications.map(med => ({
        ...med,
        note: med.note || '' // Assure une valeur par défaut
      }))
    };

    patient.prescriptions.push(req.body);
    await patient.save();

    res.status(200).json({ message: "Ordonnance ajoutée avec succès", patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addMedicalFilesToPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });
    
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
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
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointmentTime = async (req, res) => {
  try {
    const { patientId, appointmentId, newAppointmentDate } = req.body;

    if (!patientId || !appointmentId || !newAppointmentDate) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const patient = await Patient.findOne({
      _id: patientId,
      doctor: req.user._id
    });
    
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    const appointment = patient.appointments.id(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Rendez-vous non trouvé" });
    }

    appointment.date = new Date(newAppointmentDate);
    await patient.save();

    res.status(200).json({ message: "Heure du rendez-vous mise à jour", patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updatePatientPhoneNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Le numéro de téléphone est requis" });
    }

    const patient = await Patient.findOne({
      _id: id,
      doctor: req.user._id
    });
    
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    patient.phoneNumber = phoneNumber;
    await patient.save();

    res.status(200).json({ message: "Numéro de téléphone mis à jour avec succès", patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 


// Ajoutez cette fonction dans votre Patient.controller.js

export const addNoteToPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      doctor: req.user._id
    });
    
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
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
    res.status(500).json({ message: error.message });
  }
};

// Ajoutez cette nouvelle fonction dans votre Patient.controller.js

export const updatePatientInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Trouver le patient
    const patient = await Patient.findOne({
      _id: id,
      doctor: req.user._id
    });
    
    if (!patient) {
      return res.status(404).json({ message: "Patient non trouvé" });
    }

    // Vérifier si l'email existe déjà pour un autre patient
    if (updateData.email && updateData.email !== patient.email) {
  if (updateData.email.trim() !== "") { // <<< Ajoutez cette condition pour les emails non vides
    const existingEmail = await Patient.findOne({
      email: updateData.email.toLowerCase(), // Bonne pratique: stocker emails en minuscules
      doctor: req.user._id,
      _id: { $ne: id }
    });
    if (existingEmail) {
      return res.status(400).json({ message: "Email déjà utilisé par un autre patient." });
    }
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

    // Gestion de l'image de profil
    let profileImage = patient.profileImage;
    const profileImageFile = req.files?.find(file => file.fieldname === 'profileImage');
    if (profileImageFile) {
      const base64Image = profileImageFile.buffer.toString("base64");
      const dataURI = `data:${profileImageFile.mimetype};base64,${base64Image}`;
      profileImage = { 
        url: dataURI, 
        addedDate: new Date() 
      };
    }

    // Mettre à jour les données
    const updatedPatient = await Patient.findByIdAndUpdate(
      id,
      {
        ...updateData,
        ...(medicalFiles.length > 0 && { 
          medicalFiles: [...(patient.medicalFiles || []), ...medicalFiles] 
        }),
        ...(profileImage && { profileImage })
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      message: "Informations du patient mises à jour avec succès", 
      patient: updatedPatient 
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: "Données invalides", error: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};