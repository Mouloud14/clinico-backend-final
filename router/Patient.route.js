import express from "express";
import multer from "multer";
import { 
  addNewPatient, 
  getAllPatients,
  getPatientsByDate, 
  getPatientById,
  markPatientAsSeen, 
  addCertificatToPatient,
  addBilanToPatient, 
  scheduleAppointment, 
  addJustificationToPatient, 
  addPrescriptionToPatient, 
  addMedicalFilesToPatient, 
  updateAppointmentTime,
  updatePatientPhoneNumber, 
  addNoteToPatient,
  updatePatientInfo,
  sendReminderNow,
} from "../controller/Patient.controller.js";
// NOUVEL IMPORT
import { isAuthenticated } from "../middlewares/auth.js"; 

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});
const router = express.Router();

// REMPLACER isAdminAuthenticated PAR isAuthenticated POUR TOUTES LES ROUTES
router.post("/addnew", isAuthenticated, upload.any(), addNewPatient);
router.get("/patients", isAuthenticated, getAllPatients);
router.get("/by-date", isAuthenticated, getPatientsByDate);
router.get("/:id", isAuthenticated, getPatientById);
router.put("/mark-seen/:id", isAuthenticated, markPatientAsSeen);
router.put("/:id/add-certificat", isAuthenticated, addCertificatToPatient);
router.put("/:id/add-bilan", isAuthenticated, addBilanToPatient);
router.put("/schedule-appointment", isAuthenticated, scheduleAppointment);
router.put("/:id/add-justification", isAuthenticated, addJustificationToPatient);
router.put("/:id/add-prescription", isAuthenticated, addPrescriptionToPatient);
router.put("/:id/add-medical-files", isAuthenticated, upload.any(), addMedicalFilesToPatient);
router.put("/update-appointment-time", isAuthenticated, updateAppointmentTime);
router.put("/:id/update-phone-number", isAuthenticated, updatePatientPhoneNumber);
router.put("/:id/add-note", isAuthenticated, addNoteToPatient);
router.put("/:id/update-info", isAuthenticated, upload.any(), updatePatientInfo);
router.put("/patient/schedule-appointment", isAuthenticated, scheduleAppointment);
router.post("/patient/send-reminder-now", isAuthenticated, sendReminderNow);

export default router;