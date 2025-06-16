import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";
import "../App.css";

Modal.setAppElement("#root");

const DossierPatient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("all");

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await axios.get(`https://clinico-backend-final.onrender.com/api/v1/patient/${id}`, {
          withCredentials: true,
        });
        setPatient(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des détails du patient :", error);
      }
    };

    fetchPatientDetails();
  }, [id]);

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("medicalFiles", file);
      });

      try {
        const response = await axios.put(
          `https://clinico-backend-final.onrender.com/api/v1/patient/${id}/add-medical-files`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );
        setPatient(response.data.patient);
      } catch (error) {
        console.error("Erreur lors de l'ajout des fichiers médicaux :", error);
      }
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

  const handleFileClick = (fileUrl) => {
    setSelectedFile(fileUrl);
    setIsModalOpen(true);
  };

  // Fonction pour rediriger vers la page de modification
  const handleEditPatient = () => {
    navigate(`/modifier-patient/${id}`);
  };

  const getGroupedDocuments = () => {
    if (!patient) return {};

    const allDocs = [
      ...(patient.prescriptions || []).map(d => ({ ...d, type: "prescription" })),
      ...(patient.bilans || []).map(d => ({ ...d, type: "bilan" })),
      ...(patient.certificats || []).map(d => ({ ...d, type: "arret" })),
      ...(patient.justifications || []).map(d => ({ ...d, type: "justification" })),
      ...(patient.notes || []).map(d => ({ ...d, type: "note" }))
    ];

    const sorted = allDocs.sort((a, b) => new Date(b.date) - new Date(a.date));

    return sorted.reduce((acc, doc) => {
      const dateKey = new Date(doc.date).toLocaleDateString("fr-FR");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(doc);
      return acc;
    }, {});
  };

  const renderDocument = (doc) => {
    switch (doc.type) {
      
      
      case "prescription":
  return (
    <div className="prescription-card" key={doc._id}>
      <div className="prescription-header">
       
        <div className="doctor-info-small">
          <p><strong>Médecin :</strong> {doc.doctorName}</p>
          <p><strong>Téléphone :</strong> {doc.doctor?.cabinetPhone || "Non renseigné"}</p>
          <p><strong>N° Ordre :</strong> {doc.doctor?.ordreNumber || "Non renseigné"}</p>
          <p><strong>Adresse :</strong> {doc.doctor?.cabinetAddress || "Non renseigné"}</p>
        </div>
        <div className="patient-data-container">
                     <p className="patient-data">Nom : {patient.lastName}</p>
                     <span className="separator">|</span>
                     <p className="patient-data">Prénom : {patient.firstName}</p>
                     <span className="separator">|</span>
                     <p className="patient-data">Age : {calculateAge(patient.dob)}</p>
                   </div>
                   <div className="document-date">
        <p><strong>Le :</strong> {new Date(doc.date).toLocaleDateString('fr-FR')}</p>
      </div>
                   
                   <strong className="titre">ORDONNANCE</strong>
        
      </div>
     
      
      {doc.notes && <p><strong>Notes :</strong> {doc.notes}</p>}
      <h4>Médicaments :</h4>
      <ul>
        {doc.medications.map((med, idx) => (
          <li key={idx}>
            <strong>{med.name} {med.dosage} mg </strong>  - {med.boxes} boîte(s)
            {med.note && <div className="medication-note"> {med.note}</div>}
          </li>
        ))}
      </ul>
      <div className="signature">
                
                <p>Signature et cachet du médecin</p>
                <p> {doc.doctorName} </p>
              </div>
    </div>
  );



  


  case "bilan":
    const tests = Object.entries(doc.tests).filter(([_, v]) => v).map(([k]) => k);
  
    // Affiche le numéro de téléphone dans la console
 

  
    return (
      <div className="bilan-card" key={doc._id}>
         <div className="doctor-info-small">
        <p><strong>Médecin :</strong> {doc.doctorName}</p>
        <p><strong>Téléphone :</strong> {doc.doctor?.cabinetPhone || "Non renseigné"}</p>
        <p><strong>Numero d'ordre :</strong> {doc.doctor?.ordreNumber || "Non renseigné"}</p>
        <p><strong>Adresse :</strong> {doc.doctor?.cabinetAddress || "Non renseigné"}</p>
        </div>
        
       
        <div className="patient-data-container">
                     <p className="patient-data">Nom : {patient.lastName}</p>
                     <span className="separator">|</span>
                     <p className="patient-data">Prénom : {patient.firstName}</p>
                     <span className="separator">|</span>
                     <p className="patient-data">Age : {calculateAge(patient.dob)}</p>
                   </div>

                   <div className="document-date">
        <p><strong>Le :</strong> {new Date(doc.date).toLocaleDateString('fr-FR')}</p>
      </div>
                   <strong className="titre">DEMANDE DE BILAN</strong>
        
       
        <h4>Tests demandés :</h4>
        <ul className="tests-list">
          {tests.map((test) => (
            <li key={test}>{test}</li>
          ))}
        </ul>
        
        <div className="signature">
                
                <p>Signature et cachet du médecin</p>
                <p> {doc.doctorName} </p>
              </div>
      </div>
      
    );
  
        

    case "arret":
      return (
        <div className="arret-card" key={doc._id}>
          
          <div className="doctor-info-small">
            <p><strong>Médecin :</strong> {doc.doctorName}</p>
            <p><strong>Téléphone :</strong> {doc.doctor?.cabinetPhone || "Non renseigné"}</p>
            <p><strong>Numero d'ordre :</strong> {doc.doctor?.ordreNumber || "Non renseigné"}</p>
            <p><strong>Adresse :</strong> {doc.doctor?.cabinetAddress || "Non renseigné"}</p>
          </div>
    
          <div className="patient-data-container">
            <p className="patient-data">Nom : {patient.lastName}</p>
            <span className="separator">|</span>
            <p className="patient-data">Prénom : {patient.firstName}</p>
            <span className="separator">|</span>
            <p className="patient-data">Age : {calculateAge(patient.dob)}</p>
          </div>
          
          <div className="document-date">
            <p><strong>Le :</strong> {new Date(doc.date).toLocaleDateString('fr-FR')}</p>
          </div>
          <strong className="titre">CERTIFICAT D'ARRÊT DE TRAVAIL</strong>
          
          <p><strong>Je soussigné,</strong> {doc.doctorName}</p>
          <p><strong>Certifie avoir examiné ce jour le (la) nommé(e)</strong> {patient.firstName} {patient.lastName}</p>
          
          {/* Modification ici */}
          {!doc.prolongationJours && (
            <p><strong>Et déclare que son état de santé nécessite un arrêt de travail de </strong>{doc.arretJours} jours </p>
          )}
          
          {doc.prolongationJours && (
            <>
              <p><strong>Et déclare que son état de santé nécessite une prolongation d'arrêt de : {doc.prolongationJours} jours</strong></p>
              {doc.prolongationStart && (
                <p><strong>du:</strong> {new Date(doc.prolongationStart).toLocaleDateString('fr-FR')} 
                <strong> au </strong> {new Date(doc.prolongationEnd).toLocaleDateString('fr-FR')}</p>
              )}
            </>
          )}
          
          <p><strong>Lui permet de reprendre son travail le :</strong> {new Date(doc.returnDate).toLocaleDateString('fr-FR')}</p>
          <div className="signature">
            <p>Signature et cachet du médecin</p>
            <p> {doc.doctorName} </p>
          </div>
        </div>
      );
          case "justification":
            return (
              <div className="justification-card" key={doc._id}>
            <div className="doctor-info-small">
        <p><strong>Médecin :</strong> {doc.doctorName}</p>
        <p><strong>Téléphone :</strong> {doc.doctor?.cabinetPhone || "Non renseigné"}</p>
        <p><strong>Numero d'ordre :</strong> {doc.doctor?.ordreNumber || "Non renseigné"}</p>
        <p><strong>Adresse :</strong> {doc.doctor?.cabinetAddress || "Non renseigné"}</p>
        </div>

        

        <div className="patient-data-container">
                     <p className="patient-data">Nom : {patient.lastName}</p>
                     <span className="separator">|</span>
                     <p className="patient-data">Prénom : {patient.firstName}</p>
                     <span className="separator">|</span>
                     <p className="patient-data">Age : {calculateAge(patient.dob)}</p>
                   </div>
                   
                   <div className="document-date">
        <p><strong>Le :</strong> {new Date(doc.date).toLocaleDateString('fr-FR')}</p>
      </div>
                
                <strong className="titre">JUSTIFICATION</strong>
                <p><strong>Je soussigné :</strong> {doc.doctorName}</p>
                <p><strong>Certifie avoir vu et examiné le(la) patient(e) âgé(e) de {calculateAge(patient.dob)} ans ce jour dont certificat</strong></p>
                
                <div className="signature">
                
                <p>Signature et cachet du médecin</p>
                <p> {doc.doctorName} </p>
              </div>
              </div>
            );


            case "note":
              return (
                <div className="note-card" key={doc._id}>
                  <div className="doctor-info-small">
                    <p><strong>Médecin :</strong> {doc.doctorName}</p>
                    <p><strong>Téléphone :</strong> {doc.doctor?.cabinetPhone || "Non renseigné"}</p>
                    <p><strong>N° Ordre :</strong> {doc.doctor?.ordreNumber || "Non renseigné"}</p>
                    <p><strong>Adresse :</strong> {doc.doctor?.cabinetAddress || "Non renseigné"}</p>
                  </div>
                  
                  <div className="patient-data-container">
                    <p className="patient-data">Nom : {patient.lastName}</p>
                    <span className="separator">|</span>
                    <p className="patient-data">Prénom : {patient.firstName}</p>
                    <span className="separator">|</span>
                    <p className="patient-data">Age : {calculateAge(patient.dob)}</p>
                  </div>
                  
                  <div className="document-date">
                    <p><strong>Le :</strong> {new Date(doc.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  
                  <strong className="titre">NOTE MÉDICALE</strong>
                  
                  <div className="note-content-display">
                    {doc.noteText.split('\n').map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                  
                  <div className="signature">
                    <p>Signature et cachet du médecin</p>
                    <p> {doc.doctorName} </p>
                  </div>
                </div>
              );

      default:
        return null;
    }
  };

  if (!patient) return <div className="loading">Chargement...</div>;

  const groupedDocs = getGroupedDocuments();
  const dates = Object.keys(groupedDocs).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="dossier-container">
      {/* Informations personnelles du patient */}
      <div className="patient-info">
      {patient.profileImage && (
    <div className="profile-image-container">
      <img
        src={patient.profileImage.url}
        alt="Photo d'identité"
        className="profile-image"
      />
    </div>
  )}
        <h2>{patient.firstName} {patient.lastName}</h2>
        
        {/* Bouton Modifier ajouté ici */}
        <button 
  onClick={handleEditPatient}
  className="edit-patient-button"
>
  ✏️ Modifier les informations
</button>
        
        <p><strong>Numéro patient:</strong> {patient.patientNumber}</p>
        <p><strong>Sexe:</strong> {
  patient.gender === "Male" ? "Masculin" :
  patient.gender === "Female" ? "Féminin" : 
  "Autre"
}</p>
        <p><strong>Age :</strong> {calculateAge(patient.dob)}</p>
        <p><strong>Groupe Sanguin :</strong> {patient.bloodGroup}</p>
        <p><strong>Date d'inscription :</strong> {new Date(patient.registrationDate).toLocaleDateString('fr-FR')}</p> {/* Ajout de la date d'inscription */}
        <p><strong>Téléphone:</strong> {patient.phoneNumber}</p>
        <p><strong>antécédent médicaux:</strong> {patient.chronicDiseases || "Aucune"}</p>
        <p><strong>antécédent chirurgicaux:</strong> {patient.pastSurgeries || "Aucune"}</p>
        <p><strong>Adresse:</strong> {patient.address}</p>
        <p><strong>Email :</strong> {patient.email}</p>
      </div>
      
      <div className="file-upload">
        <label htmlFor="fileInput">Ajouter fichiers médicaux :</label>
        <input type="file" id="fileInput" multiple onChange={handleFileUpload} />
      </div>

      <div className="date-filter">
        <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="date-select">
          <option value="all">Toutes les dates</option>
          {dates.map(date => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>
      </div>

      <div className="documents-timeline">
        {dates.map(date => {
          if (selectedDate !== "all" && date !== selectedDate) return null;

          return (
            <div key={date} className="date-group">
              <h3 className="group-date">{date}</h3>
              <div className="documents-list">
                {groupedDocs[date].map(doc => renderDocument(doc))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fichiers médicaux uploadés */}
      {patient.medicalFiles && patient.medicalFiles.length > 0 && (
  <div className="medical-files-section">
    <h3>Fichiers Médicaux</h3>
    <div className="medical-files-list">
      {patient.medicalFiles.map((file, idx) => (
        <div key={idx} className="file-preview" onClick={() => handleFileClick(file.url)}>
          {file.url.startsWith("data:application/pdf") ? ( // Ici
            <div className="pdf-icon">
              📄 PDF
              <p className="file-date">
                {new Date(file.addedDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          ) : (
            <div className="image-container">
              <img src={file.url} alt={`medical-${idx}`} className="thumbnail" />
              <p className="file-date">
                {new Date(file.addedDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}
      <Modal
  isOpen={isModalOpen}
  onRequestClose={() => setIsModalOpen(false)}
  className="modal"
  overlayClassName="overlay"
  closeTimeoutMS={300}
>
  {selectedFile && (
    <>
      {selectedFile.startsWith("data:application/pdf") ? (
        <iframe 
          src={selectedFile} 
          title="PDF" 
          className="modal-pdf" 
        />
      ) : (
        <img 
          src={selectedFile} 
          alt="Document médical" 
          className="modal-image" 
        />
      )}
      <button 
        onClick={() => setIsModalOpen(false)} 
        className="close-modal"
      >
        Fermer
      </button>
    </>
  )}
</Modal>
    </div>
  );
};

export default DossierPatient;