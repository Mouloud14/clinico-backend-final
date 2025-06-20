import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Context } from "./main";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import AddNewPatient from "./components/AddNewPatient";
import Sidebar from "./components/Sidebar";
import Patient from "./components/Patient";
import AddPrescription from "./components/AddPrescription";
import Calendar from "./components/Calendar";
import ChangePassword from './components/ChangePassword';
import DossierPatient from "./components/DossierPatient";
import PrescriptionOptions from "./components/PrescriptionOptions";
import Bilan from "./components/Bilan";
import CertificatArret from "./components/CertificatArret";
import Justification from "./components/Justification";
import Blocnote from "./components/Blocnote";
import "./App.css";

// Configure Axios pour envoyer les cookies avec chaque requête par défaut
axios.defaults.withCredentials = true;

const App = () => {
  const { isAuthenticated, setIsAuthenticated, admin, setAdmin } = useContext(Context);
  console.log("APP LOG: Current isAuthenticated state on render:", isAuthenticated);
  console.log("APP LOG: Admin state (on render, before fetch):", admin); // Log avant la requête


  useEffect(() => {
    const fetchUser = async () => {
      console.log("APP LOG: fetchUser called to verify authentication.");
      try {
        // --- LOGS DE DIAGNOSTIC ---
        console.log("APP.JS LOG: Tentative de fetch user (GET /admin/me). État initial isAuthenticated:", isAuthenticated);

        // --- CORRECTION CRUCIALE DE L'URL ICI ! ---
        const response = await axios.get(
          "https://clinico-backend-final.onrender.com/api/v1/user/admin/me", // L'URL CORRECTE pour vérifier l'authentification
          { withCredentials: true }
        );
        console.log("APP LOG: /admin/me SUCCESS. Full response data:", response.data); // Log la réponse complète
        console.log("APP LOG: /admin/me SUCCESS. User object from response:", response.data.user); // Log l'objet user
        setIsAuthenticated(true);
        setAdmin(response.data.user);
        // --- LOG DE SUCCÈS ---
        console.log("APP.JS LOG: Utilisateur fetché avec succès:", response.data.user.email);
        console.log("APP LOG: Admin state UPDATED in context to:", response.data.user); // Log l'objet après setAdmin
      } catch (error) {
        setIsAuthenticated(false);
        setAdmin({});
        console.log("APP LOG: Admin state RESET in context.");
        // --- LOG D'ERREUR ---
        console.error("APP.JS ERROR: Échec du fetch user. Message d'erreur:", error.response?.data?.message || error.message);
        // console.error("APP.JS ERROR: Détails complets de l'erreur:", error); // Peut être décommenté pour plus de détails si besoin
      }
    };

    // Lance fetchUser une seule fois au montage du composant App.
    // Le tableau de dépendances vide [] empêche les exécutions multiples inutiles.
    fetchUser();
  }, []); // Dépendances vides pour un seul appel au montage

  // Ce bloc gère la redirection si isAuthenticated est faux AU MOMENT DU RENDER
  // (après le premier chargement ou si fetchUser le remet à false)
  // Dashboard.jsx contient également une redirection similaire.
  if (!isAuthenticated) {
    console.log("APP LOG: Non authentifié, redirection vers /login.");
    // Pas de <Navigate /> direct ici pour éviter les boucles si Dashboard.jsx s'en occupe déjà
  }
  // Pour un état de chargement initial, avant que fetchUser n'ait eu le temps de s'exécuter
  if (isAuthenticated === undefined) { 
    return <div>Chargement de l'authentification...</div>;
  }


  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Patient/addnew" element={<AddNewPatient />} />
        <Route path="/patients" element={<Patient />} />
        <Route path="/prescription" element={<AddPrescription />} />
        <Route path="/calendar" element={<Calendar />} />
        
        <Route path="/dossier-patient/:id" element={<DossierPatient />} />
        <Route path="/prescription-options" element={<PrescriptionOptions />} />
        <Route path="/bilan" element={<Bilan />} />
        <Route path="/certificat-arret" element={<CertificatArret />} />
        <Route path="/justification" element={<Justification />} />
        <Route path="/blocnote" element={<Blocnote />} />
        <Route path="/change-password" element={<ChangePassword />} />
        {/* Assure-toi que cette route est bien là pour la modification */}
        <Route path="/modifier-patient/:id" element={<AddNewPatient />} /> 
      </Routes>
      <ToastContainer position="top-center" />
    </Router>
  );
};

export default App;