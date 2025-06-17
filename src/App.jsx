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
axios.defaults.withCredentials = true;

const App = () => {
  const { isAuthenticated, setIsAuthenticated, admin, setAdmin } =
    useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "https://clinico-backend-final.onrender.com",
          { withCredentials: true }
        );
        setIsAuthenticated(true);
        setAdmin(response.data.user);
      } catch (error) {
        setIsAuthenticated(false);
        setAdmin({});
        // Si l'utilisateur n'est pas authentifié et qu'il n'est pas sur la page de login, redirigez-le
        // if (window.location.pathname !== "/login") {
        //   window.location.href = "/login"; // Redirige de force
        // }
      }
    };
    fetchUser();
  }, [isAuthenticated]); // Déclenché quand isAuthenticated change
  if (!isAuthenticated) {
    console.log("APP LOG: Non authentifié, retour vers /login"); // <<< AJOUTÉ
    // Il y a déjà un return <Navigate to={"/login"} />; dans Dashboard.jsx,
    // donc assurez-vous qu'il n'y a pas un Navigate ici qui écrase tout.
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
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/blocnote" element={<Blocnote />} />
        <Route path="/modifier-patient/:id" element={<AddNewPatient />} />
     </Routes>
      <ToastContainer position="top-center" />
    </Router>
  );
};

export default App;
