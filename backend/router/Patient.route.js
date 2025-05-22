import express from "express";
import multer from "multer";
import { addNewPatient, getAllPatients,getPatientsByDate, getPatientById,markPatientAsSeen, addCertificatToPatient,addBilanToPatient, scheduleAppointment, addJustificationToPatient, addPrescriptionToPatient, addMedicalFilesToPatient, updateAppointmentTime,updatePatientPhoneNumber } from "../controller/Patient.controller.js";
import { isAdminAuthenticated } from "../middlewares/auth.js"; 

const storage = multer.memoryStorage(); // Stockage en mémoire
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // Limite à 10MB
});
const router = express.Router();

router.post("/addnew",isAdminAuthenticated, upload.any(), addNewPatient);
router.get("/patients",isAdminAuthenticated, getAllPatients);

router.get("/by-date",isAdminAuthenticated, getPatientsByDate);
router.get("/:id",isAdminAuthenticated, getPatientById); // Ajout dans Patient.route.js
router.put("/mark-seen/:id",isAdminAuthenticated, markPatientAsSeen);
router.put("/:id/add-certificat",isAdminAuthenticated, addCertificatToPatient);
// Dans Patient.route.js
router.put("/:id/add-bilan",isAdminAuthenticated, addBilanToPatient);
router.put("/schedule-appointment",isAdminAuthenticated, scheduleAppointment);
// Ajouter cette ligne après les autres routes
router.put("/:id/add-justification",isAdminAuthenticated, addJustificationToPatient);
// Ajouter cette ligne
router.put("/:id/add-prescription",isAdminAuthenticated, addPrescriptionToPatient);
router.put("/:id/add-medical-files",isAdminAuthenticated, upload.any(), addMedicalFilesToPatient);
router.put("/update-appointment-time",isAdminAuthenticated, updateAppointmentTime);
router.put("/:id/update-phone-number",isAdminAuthenticated, updatePatientPhoneNumber);

export default router;