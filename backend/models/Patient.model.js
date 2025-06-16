import mongoose from "mongoose";

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
    appointments: [{
      date: { type: Date, required: true }}],
    seen: { type: Boolean, default: false }, 
    
    
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
      }
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
        name: String,
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

export const Patient = mongoose.model("Patient", patientSchema);