import React, { useState, useEffect, useContext } from 'react';
import { Context } from "../main";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const AddPrescription = () => {
  const { admin } = useContext(Context);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [medications, setMedications] = useState([{ name: '', dosage: '', boxes: '', note: '' }]);
  const [notes, setNotes] = useState('');
  const currentDate = new Date().toLocaleDateString('fr-FR');
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/patients`,
          {withCredentials: true}
        );
        setPatients(response.data.patients);
      } catch (error) {
        console.error("Erreur de chargement des patients:", error);
      }
    };
    fetchPatients();
  }, []);

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...medications];
    newMedications[index][field] = value;
    setMedications(newMedications);
  };

  const addMedicationField = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', boxes: '', note: '' }]);
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
    const prescriptionData = {
      date: new Date().toISOString(),
      doctorName: `Dr. ${admin.firstName} ${admin.lastName}`,
      doctor: {
        cabinetPhone: admin.cabinetPhone,
        ordreNumber: admin.ordreNumber,
        cabinetAddress: admin.cabinetAddress,
      },
      medications: medications.filter(med => med.name && med.dosage),
      notes
    };

    try {
  const response = await axios.put(
    `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/${selectedPatient}/add-prescription`, // <<< CORRIGEZ EXACTEMENT COMME CECI
    prescriptionData,
    {
      withCredentials: true // Ajouté ici
    }
  );

      if (response.status === 200) {
        alert("Ordonnance enregistrée avec succès");
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
                <h2 className="certificate-title">ORDONNANCE MÉDICALE</h2>
              
           <div className="prescription-content">
              
              <h3>Médicaments prescrits :</h3>
              <ul className="medications-list">
                {medications.filter(med => med.name).map((med, idx) => (
                  <li key={idx}>
                    <strong>- {med.name} {med.dosage} mg </strong> - {med.boxes} boîte(s)
                    {med.note && <div className="medication-note"> {med.note}</div>}
                  </li>
                ))}
              </ul>

              

              <div className="signature">
                
                <p>Signature et cachet du médecin</p>
                <p>Dr {admin?.firstName} {admin?.lastName}</p>
              </div>
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
          <h2>Nouvelle Ordonnance</h2>
          <form onSubmit={handleSubmit} className="add-prescription-form">
            <div className="form-row">
              <div className="form-group">
                <label>Date :</label>
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

            <div className="medications-form">
              <h3>Médicaments</h3>
              {medications.map((med, index) => (
                <div key={index} className="medication-row">
                  <input
                    type="text"
                    placeholder="Nom du médicament"
                    value={med.name}
                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    
                  />
                  <input
                    type="text"
                    placeholder="Dosage"
                    value={med.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    
                  />
                  
                  
                 
                        <input
                               type="number"
                               placeholder="Boîtes"
                               value={med.boxes}
                               onChange={(e) => handleMedicationChange(index, 'boxes', e.target.value)}
                               min="1"
                               
                        />

<textarea
      className="medication-note-input"
      placeholder="Note supplémentaire..."
      value={med.note}
      onChange={(e) => handleMedicationChange(index, 'note', e.target.value)}
      rows="2"
    />

                </div>
              ))}
              <button type="button" onClick={addMedicationField} className="add-button">
                Ajouter un médicament
              </button>
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

export default AddPrescription;
