import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    seenStatus: { type: Boolean, default: false },
    emailReminderSent: { type: Boolean, default: false },
    emailReminderSentAt: { type: Date, default: null },

 emailReminderActive: { // Si le rappel est activé pour ce RDV
        type: Boolean,
        default: false,
    },
    emailReminderTime: { // '24h-before', 'manual-now', 'custom-date'
        type: String,
        enum: ['24h-before', 'manual-now', 'custom-date'], // Ajoutez 'manual-now' pour le stockage si nécessaire
        default: '24h-before', // Valeur par défaut si non spécifié
        nullable: true, // Peut être null si emailReminderActive est false
    },
    customReminderDate: { // Pour l'option 'custom-date'
        type: Date,
        nullable: true, // Peut être null si l'option n'est pas 'custom-date'
    },
    emailReminderSent: { // Si le rappel a déjà été envoyé
        type: Boolean,
        default: false,
    },
    emailReminderSentAt: { // Date et heure d'envoi du rappel
        type: Date,
        nullable: true,
    },
});

const patientSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    patientNumber: { type: String, required: false}, // Modifié: non obligatoire
   
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { 
      type: String, 
      required: false, // Modifié: non obligatoire
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email invalide"]
    },
    address: { type: String, required: false }, // Modifié: non obligatoire
    dob: { type: Date, required: false }, // Modifié: non obligatoire
    weight: { type: Number, required: false }, // Modifié: non obligatoire
    height: { type: Number, required: false }, // Modifié: non obligatoire
    bloodGroup: { type: String, required: false }, // Modifié: non obligatoire
    chronicDiseases: { type: String },
    pastSurgeries: { type: String },
    medicalFiles: [{
      url: String,
      addedDate: { type: Date, default: Date.now }
    }],
    profileImage: {
      url: String,
      addedDate: { type: Date, default: Date.now }
    },
    phoneNumber: { type: String, required: true },
    gender: {
      type: String,
      required: false, // Modifié: non obligatoire
      enum: ["Male", "Female", "Other"]
    },
    appointments: [appointmentSchema],
    
    certificats: [{
      date: Date,
      doctorName: String,
      doctor: {
        cabinetPhone: String,
        ordreNumber: String,
        cabinetAddress: String,
      },
      startDate: Date,
      endDate: Date,
      prolongationStart: Date,
      prolongationEnd: Date,
      returnDate: Date,
      arretJours: String,
      prolongationJours: String
    }],
    
    bilans: [{
      date: Date,
      doctorName: String,
      doctor: {
        cabinetPhone: String,
        ordreNumber: String,
        cabinetAddress: String,
      },
      tests: {
        FNS: Boolean,
        CRP: Boolean,
        VS: Boolean,
        TSHus: Boolean,
        HbA1c: Boolean,
        HDL_LDL: Boolean,
        Triglycerides: Boolean,
        TauxAcideUrique: Boolean
      },
      additionalTests: [String] // Nouveau champ pour tests supplémentaires
    }],
    
    justifications: [{
       date: Date,
       doctorName: String,
       doctor: {
         cabinetPhone: String,
         ordreNumber: String,
         cabinetAddress: String,
      },
         justificationText: String
    }],

    notes: [{
      date: Date,
      doctorName: String,
      doctor: {
        cabinetPhone: String,
        ordreNumber: String,
        cabinetAddress: String,
      },
      noteText: String
    }],

    prescriptions: [{
      date: Date,
      doctorName: String,
      doctor: {
        cabinetPhone: String,
        ordreNumber: String,
        cabinetAddress: String,
      },
      medications: [{
        medicamentId: mongoose.Schema.Types.ObjectId,
        nomCommercial: String,
        dosage: String,
        frequency: String,
        boxes: Number,
        duration: String,
        note: String 
      }],
    }],
     
   
    registrationDate: { type: Date, default: Date.now }
    
  },
  { timestamps: true }
);


// Méthode pour générer automatiquement un numéro de patient
patientSchema.pre('save', async function(next) {
  if (!this.patientNumber) {
    const count = await this.constructor.countDocuments({ doctor: this.doctor });
    this.patientNumber = `P${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model("Patient", patientSchema);