import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Patient = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPhoneNumber, setEditingPhoneNumber] = useState(null);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/v1/patient/patients", 
          { 
            withCredentials: true // Ajoutez cette ligne
          }
        );
        setPatients(response.data.patients);
      } catch (error) {
        console.error("Erreur lors de la récupération des patients :", error);
      }
    };
  
    fetchPatients();
  }, []);

  const handlePatientClick = (patientId) => {
    navigate(`/dossier-patient/${patientId}`);
  };
  const handleUpdatePhoneNumber = async (patientId) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/v1/patient/${patientId}/update-phone-number`,
        {
          phoneNumber: newPhoneNumber,
        },
        {
          withCredentials: true // Ajoutez cette ligne
        }
      );
      // ... reste du code
    } catch (error) {
      console.error("Erreur lors de la mise à jour du numéro de téléphone :", error);
    }
  };

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
                {editingPhoneNumber === patient._id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="text"
                      value={newPhoneNumber}
                      onChange={(e) => setNewPhoneNumber(e.target.value)}
                      style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button
                      onClick={() => handleUpdatePhoneNumber(patient._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <i className="fas fa-check" style={{ color: 'green', fontSize: '16px' }}></i>
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {patient.phoneNumber}
                    <button
                      onClick={() => setEditingPhoneNumber(patient._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <i className="fas fa-pen" style={{ color: '#3939d9f2', fontSize: '14px' }}></i>
                    </button>
                  </div>
                )}
              </td>
              <td>
                <button onClick={() => handlePatientClick(patient._id)}>
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