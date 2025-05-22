import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    patientNumber: { type: String, required: true},
   
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Email invalide"]
    },
    address: { type: String, required: true },
    dob: { type: Date, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },
    bloodGroup: { type: String, required: true },
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
      required: true,
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
      arretJours: String, // Ajouté
      prolongationJours: String // Ajouté
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
   
registrationDate: { type: Date, default: Date.now } // Ajout de la date d'inscription
},
  { timestamps: true }
);

export const Patient = mongoose.model("Patient", patientSchema);