import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../main";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const Bilan = () => {
  const { admin } = useContext(Context);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const currentDate = new Date().toLocaleDateString('fr-FR');
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const [selectedTests, setSelectedTests] = useState({
    FNS: false,
    CRP: false,
    VS: false,
    TSHus: false,
    HbA1c: false,
    HDL_LDL: false,
    Triglycerides: false,
    TauxAcideUrique: false
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get("https://clinico-backend-final.onrender.com/api/v1/patient/patients",
           { withCredentials: true }
        );
        setPatients(response.data.patients);
      } catch (error) {
        console.error("Erreur de chargement des patients:", error);
      }
    };
    fetchPatients();
  }, []);

  const handleTestChange = (testName) => {
    setSelectedTests(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!admin || !selectedPatient) {
      alert("Veuillez sélectionner un patient");
      return;
    }
    
    setShowPreview(true);
  };

  const handleSave = async () => {
    const bilanData = {
      date: new Date().toISOString().split('T')[0],
      doctorName: `Dr. ${admin.firstName} ${admin.lastName}`,
      doctor: {
        cabinetPhone: admin.cabinetPhone,
        ordreNumber: admin.ordreNumber,
        cabinetAddress: admin.cabinetAddress,
      },
      tests: selectedTests
    };

    try {
      const response = await axios.put(
        `https://clinico-backend-final.onrender.com/api/v1/patient/${selectedPatient}/add-bilan`,
        bilanData,
        {
          withCredentials: true // Ajouté ici
        }
      );

      if (response.status === 200) {
        alert("Bilan enregistré avec succès");
        navigate("/");
      }
    } catch (error) {
      console.error("Erreur :", error.message);
      alert(error.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  };
  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  const selectedPatientData = patients.find(p => p._id === selectedPatient);
  const selectedTestsList = Object.keys(selectedTests).filter(test => selectedTests[test]);

  return (
    <div className="form-component">
      {showPreview ? (
        <div className="certificate-preview">
          <div className="preview-content">
            
            <div className="certificate-body">
            <div className="doctor-header">
               <div className="doctor-info">
                  <div>N°: {admin?.ordreNumber}</div>
                  <div>Dr. {admin?.firstName} {admin?.lastName}</div>
                  <div>Spécialité : {admin?.specialite}</div>
                  <div>{admin?.cabinetAddress}</div>
                  <div>Tél: {admin?.cabinetPhone}</div>
               </div>
           
            
              <div className="date-div">
               <p>Fait le {currentDate}</p>
              </div>
              </div>
            
            <div className="patient-data-container">
                     <p className="patient-data">Nom : {selectedPatientData.lastName}</p>
                     <span className="separator">|</span>
                     <p className="patient-data">Prénom : {selectedPatientData.firstName}</p>
                     <span className="separator">|</span>
                     <p className="patient-data">Age : {calculateAge(selectedPatientData.dob)}</p>
                   </div>
            <h2 className="certificate-title">DEMANDE DE BILAN </h2>
            

              
              <h3>Examens prescrits :</h3>
              <ul className="tests-list">
                {selectedTestsList.map(test => (
                  <li key={test}>{test}</li>
                ))}
              </ul>

              <div className="signature">
                
                <p>Signature et cachet du médecin</p>
                <p>Dr {admin?.firstName} {admin?.lastName}</p>
              </div>
            </div>
          </div>

          <div className="preview-actions no-print">
          <div className="button-container">
            <button className="print-button" onClick={() => window.print()}>
              Imprimer
            </button>
            <button className="edit-button" onClick={() => setShowPreview(false)}>
              Modifier
            </button>
            <button className="submit-button" onClick={handleSave}>
              Enregistrer
            </button>
          </div>
        </div>
        </div>
      ) : (
        <>
          <h2>Page Bilan</h2>
          <form onSubmit={handleSubmit} className="add-prescription-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date du bilan :</label>
                <input type="text" value={currentDate} readOnly className="disabled-field" />
              </div>
              
              <div className="form-group">
                <label>Médecin :</label>
                <input 
                  type="text" 
                  value={admin ? `Dr. ${admin.firstName} ${admin.lastName}` : "Chargement..."} 
                  readOnly
                  className="disabled-field"
                />
              </div>
            </div>

            <div className="form-group">
  <label>Patient :</label>
  <div className="searchable-dropdown">
    <input
      type="text"
      placeholder="Rechercher par nom ou prénom..."
      value={searchTerm}
      onChange={(e) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);
        if (selectedPatient) {
          const selected = patients.find(p => p._id === selectedPatient);
          if (selected && `${selected.firstName} ${selected.lastName}` !== newSearchTerm) {
            setSelectedPatient("");
          }
        }
        setIsDropdownOpen(true);
      }}
      onClick={() => setIsDropdownOpen(true)}
    />
    {isDropdownOpen && (
      <div className="dropdown-list">
        {filteredPatients.length > 0 ? (
          filteredPatients.map(patient => (
            <div
              key={patient._id}
              className="dropdown-item"
              onClick={() => {
                setSelectedPatient(patient._id);
                setSearchTerm(`${patient.firstName} ${patient.lastName}`);
                setIsDropdownOpen(false);
              }}
            >
              {patient.patientNumber} - {patient.firstName} {patient.lastName}
            </div>
          ))
        ) : (
          <div className="dropdown-no-results">Aucun patient trouvé</div>
        )}
      </div>
    )}
  </div>
</div>

            <div className="tests-grid">
              {Object.keys(selectedTests).map(test => (
                <div className="test-item" key={test}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={selectedTests[test]} 
                      onChange={() => handleTestChange(test)}
                    /> {test}
                  </label>
                </div>
              ))}
            </div>

            <button type="submit" className="submit-button">
              Voir aperçu
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Bilan;