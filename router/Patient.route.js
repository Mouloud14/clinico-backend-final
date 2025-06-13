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
  updatePatientInfo // Nouvelle fonction ajoutée
} from "../controller/Patient.controller.js";
import { isAdminAuthenticated } from "../middlewares/auth.js"; 

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});
const router = express.Router();

router.post("/addnew", isAdminAuthenticated, upload.any(), addNewPatient);
router.get("/patients", isAdminAuthenticated, getAllPatients);
router.get("/by-date", isAdminAuthenticated, getPatientsByDate);
router.get("/:id", isAdminAuthenticated, getPatientById);
router.put("/mark-seen/:id", isAdminAuthenticated, markPatientAsSeen);
router.put("/:id/add-certificat", isAdminAuthenticated, addCertificatToPatient);
router.put("/:id/add-bilan", isAdminAuthenticated, addBilanToPatient);
router.put("/schedule-appointment", isAdminAuthenticated, scheduleAppointment);
router.put("/:id/add-justification", isAdminAuthenticated, addJustificationToPatient);
router.put("/:id/add-prescription", isAdminAuthenticated, addPrescriptionToPatient);
router.put("/:id/add-medical-files", isAdminAuthenticated, upload.any(), addMedicalFilesToPatient);
router.put("/update-appointment-time", isAdminAuthenticated, updateAppointmentTime);
router.put("/:id/update-phone-number", isAdminAuthenticated, updatePatientPhoneNumber);
router.put("/:id/add-note", isAdminAuthenticated, addNoteToPatient);
router.put("/:id/update-info", isAdminAuthenticated, upload.any(), updatePatientInfo); // Nouvelle route

export default router;