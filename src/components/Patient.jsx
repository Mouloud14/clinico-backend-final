import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Patient = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/patients`, 
          { 
            withCredentials: true // Ajoutez cette ligne
          }
        );
        setPatients(response.data.patients);
        console.log("PATIENT PAGE LOG: Réponse réussie, patients reçus:", response.data.patients.length);
      } catch (error) {
        console.error("Erreur lors de la récupération des patients :", error);
        console.error("PATIENT PAGE LOG: Détails de l'erreur complète:", error);
      }
    };
  
    fetchPatients();
  }, []);

  const handlePatientClick = (patientId) => {
    navigate(`/dossier-patient/${patientId}`);
  };
;

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.lastName.toLowerCase().includes(searchLower) ||
      patient.firstName.toLowerCase().includes(searchLower) ||
      patient.patientNumber.toString().toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="patient-list">
      <h2>Liste des Patients inscrits dans la clinique</h2>
      
      <input
        type="text"
        placeholder="Rechercher par nom, prénom ou numéro..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          marginBottom: '20px',
          padding: '8px',
          width: '300px',
          borderRadius: '4px',
          border: '1px solid #ccc'
        }}
      />

      <table>
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Telephone</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.map((patient) => (
            <tr key={patient._id}>
              <td>{patient.patientNumber}</td>
              <td>{patient.lastName}</td>
              <td>{patient.firstName}</td>
              <td>
  {patient.phoneNumber} {/* Affiche seulement le numéro de téléphone */}
</td>
              <td>
  <button className="btn-view" onClick={() => handlePatientClick(patient._id)}> 
    Voir Dossier
  </button>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Patient;