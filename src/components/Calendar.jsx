import React, { useState, useEffect, useRef  } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-toastify";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";

const AppointmentCalendar = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("09:00");
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [appointmentTimes, setAppointmentTimes] = useState({});
  const appointmentsRef = useRef(null);
  const [newPatientFirstName, setNewPatientFirstName] = useState("");
  const [newPatientLastName, setNewPatientLastName] = useState("");
  const [newPatientPhoneNumber, setNewPatientPhoneNumber] = useState("");
  const [showNewPatientFields, setShowNewPatientFields] = useState(false); // Nouvel état

  // Effet pour charger les rendez-vous et les patients au montage du composant
  useEffect(() => {
    fetchAppointments(date);
    fetchAllPatients();
  }, [date]);

  // Effet pour initialiser les heures des rendez-vous
  useEffect(() => {
    if (appointments.length > 0) {
      const times = {};
      appointments.forEach((patient) => {
        patient.appointments.forEach((appt) => {
          times[appt._id] = format(new Date(appt.date), "HH:mm"); // Formater l'heure du rendez-vous
        });
      });
      setAppointmentTimes(times); // Mettre à jour l'état des heures des rendez-vous
    }
  }, [appointments]);

  // Fonction pour récupérer les rendez-vous d'une date spécifique
 const fetchAppointments = async (selectedDate) => {
  try {
    const response = await axios.get(
  `https://clinico-backend-final.onrender.com/api/v1/patient/by-date?date=${selectedDate.toISOString()}`, // <<< CELA DOIT ÊTRE L'URL PROPRE
  
);
    setAppointments(response.data.patients);
  } catch (error) {
    toast.error("Erreur lors du chargement des rendez-vous");
  }
};

  // Fonction pour récupérer tous les patients
  const fetchAllPatients = async () => {
    try {
      const response = await axios.get("https://clinico-backend-final.onrender.com/api/v1/patient/patients",
        {withCredentials: true }
      );
      setPatients(response.data.patients); // Mettre à jour l'état des patients
    } catch (error) {
      toast.error("Erreur lors du chargement des patients");
    }
  };

  // Fonction pour gérer le changement de date dans le calendrier
  const handleDateTimeChange = (newDate) => {
    const [hours, minutes] = time.split(":");
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    setDate(newDate); // Mettre à jour la date sélectionnée
    
    setTimeout(() => {
      if (appointmentsRef.current) {
        appointmentsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  

  // Fonction pour programmer un nouveau rendez-vous
  const scheduleAppointment = async () => {
    let patientIdToSchedule = selectedPatient; // Par défaut, c'est un patient existant

    // Si l'option "Ajouter un nouveau patient" est sélectionnée (valeur spéciale, par ex. "new")
    if (selectedPatient === "new") {
        // 1. Validation des champs du nouveau patient
        if (!newPatientFirstName || !newPatientLastName || !newPatientPhoneNumber) {
            toast.error("Veuillez remplir le nom, prénom et numéro de téléphone du nouveau patient.");
            return;
        }
        const phoneRegex = /^(05|06|07)\d{8}$/;
        if (!phoneRegex.test(newPatientPhoneNumber)) {
            toast.error("Le numéro de téléphone doit commencer par 05, 06 ou 07 et contenir 10 chiffres.");
            return;
        }

        // 2. Créer le nouveau patient via l'API (similaire à addNewPatient)
        try {
            const newPatientData = new FormData();
            newPatientData.append("firstName", newPatientFirstName);
            newPatientData.append("lastName", newPatientLastName);
            newPatientData.append("phoneNumber", newPatientPhoneNumber);
            // Vous pouvez ajouter d'autres champs obligatoires si nécessaire ici, ou les laisser vides pour le backend.
            // Par exemple, si 'email' est requis côté backend pour certains flux, même si optionnel pour l'inscription.
            // Assurez-vous que le backend gère bien les champs manquants ou optionnels.

            const response = await axios.post(
                "https://clinico-backend-final.onrender.com/api/v1/patient/addnew",
                newPatientData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                }
            );
            patientIdToSchedule = response.data.patient._id; // Récupérez l'ID du nouveau patient
            toast.success("Nouveau patient ajouté avec succès !");

            // Réinitialiser les champs du nouveau patient
            setNewPatientFirstName("");
            setNewPatientLastName("");
            setNewPatientPhoneNumber("");
            setSelectedPatient(""); // Réinitialiser le sélecteur
            fetchAllPatients(); // Recharger la liste des patients pour inclure le nouveau

        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de l'ajout du nouveau patient.");
            console.error(error);
            return; // Arrêter la fonction si l'ajout du patient échoue
        }
    }

    // Si aucun patient n'est sélectionné après la logique ci-dessus
    if (!patientIdToSchedule || patientIdToSchedule === "new") { // S'assurer qu'un ID valide est là
        toast.error("Veuillez sélectionner ou ajouter un patient pour le rendez-vous.");
        return;
    }

    // 3. Programmer le rendez-vous (logique existante, mais avec patientIdToSchedule)
    try {
        const [hours, minutes] = time.split(":");
        const appointmentDate = new Date(date);
        appointmentDate.setHours(hours);
        appointmentDate.setMinutes(minutes);

        const response = await axios.put(
            "https://clinico-backend-final.onrender.com/api/v1/patient/schedule-appointment",
            {
                patientId: patientIdToSchedule, // Utilisez l'ID du patient existant ou nouveau
                appointmentDate: appointmentDate.toISOString(),
            },
            
        );

        toast.success("Rendez-vous programmé !");
        fetchAppointments(date); // Recharger les rendez-vous après la programmation
    } catch (error) {
        toast.error(error.response?.data?.message || "Erreur lors de la programmation.");
    }
};
  
  // Fonction pour marquer un patient comme "Vu"
  const handleMarkAsSeen = async (patientId) => {
    try {
      await axios.put(
        `https://clinico-backend-final.onrender.com/api/v1/patient/mark-seen/${patientId}`,
        {},
        
      );
      toast.success("Statut mis à jour");
      fetchAppointments(date); // Recharger les rendez-vous après la mise à jour
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  // Fonction pour mettre à jour l'heure d'un rendez-vous
  const handleUpdateAppointmentTime = async (patientId, appointmentId, newTime) => {
    try {
      const newAppointmentDate = new Date(newTime);
      await axios.put(
        "https://clinico-backend-final.onrender.com/api/v1/patient/update-appointment-time",
        {
          patientId,
          appointmentId,
          newAppointmentDate: newAppointmentDate.toISOString(),
        },
        
      );
      toast.success("Heure du rendez-vous mise à jour");
      fetchAppointments(date); // Recharger les rendez-vous après la mise à jour
    } catch (error) {
      toast.error("Échec de la mise à jour de l'heure du rendez-vous");
    }
  };

  // Fonction pour rediriger vers le dossier du patient
  const handleViewPatientFile = (patientId) => {
    navigate(`/dossier-patient/${patientId}`);
  };

  // Dans votre fichier Calendar.jsx, remplacez la partie return par :

return (
  <div className="calendar-container">
    <h2>Calendrier des Rendez-vous</h2>

    {/* Container pour calendrier + formulaire côte à côte */}
    <div className="calendar-form-container">
      {/* Calendrier pour sélectionner une date */}
    

      {/* Formulaire pour programmer un nouveau rendez-vous */}
      {/* Formulaire pour programmer un nouveau rendez-vous */}
<div className="appointment-form">
  <h3>Programmer un nouveau rendez-vous</h3>

  <div className="time-selection">
    <label>Heure : </label>
    <input
      type="time"
      value={time}
      onChange={(e) => setTime(e.target.value)}
      required
    />
  </div>

  {/* Sélection du patient existant */}
  <select
    onChange={(e) => {
      setSelectedPatient(e.target.value);
      // Quand on choisit un patient existant, on masque les champs du nouveau patient
      setShowNewPatientFields(false);
      // Réinitialiser les champs du nouveau patient quand un existant est choisi
      setNewPatientFirstName("");
      setNewPatientLastName("");
      setNewPatientPhoneNumber("");
    }}
    value={selectedPatient}
  >
    <option value="">Sélectionner un patient</option>
    {patients.map((patient) => (
      <option key={patient._id} value={patient._id}>
        {patient.firstName} {patient.lastName} (N°{patient.patientNumber})
      </option>
    ))}
  </select>

  {/* Bouton pour afficher les champs d'ajout de nouveau patient */}
  {!showNewPatientFields && (
    <button
      type="button" // Important: C'est un bouton "normal", pas de soumission de formulaire
      onClick={() => {
        setShowNewPatientFields(true); // Affiche les champs
        setSelectedPatient("new"); // Sélectionne "new" implicitement
      }}
      className="add-new-patient-btn" // Nouvelle classe pour styliser
    >
      + Ajouter un nouveau patient
    </button>
  )}

  {/* Champs pour le nouveau patient (conditionnels) */}
  {showNewPatientFields && (
    <div className="new-patient-fields-container"> {/* Nouveau conteneur pour le style */}
      <h4>Nouveau Patient</h4>
      <input
        type="text"
        placeholder="Prénom *"
        value={newPatientFirstName}
        onChange={(e) => setNewPatientFirstName(e.target.value)}
        className="appointment-form-input"
        required={showNewPatientFields} // Requis seulement si visible
      />
      <input
        type="text"
        placeholder="Nom *"
        value={newPatientLastName}
        onChange={(e) => setNewPatientLastName(e.target.value)}
        className="appointment-form-input"
        required={showNewPatientFields} // Requis seulement si visible
      />
      <input
        type="text"
        placeholder="Numéro de téléphone *"
        value={newPatientPhoneNumber}
        onChange={(e) => setNewPatientPhoneNumber(e.target.value)}
        className="appointment-form-input"
        required={showNewPatientFields} // Requis seulement si visible
      />
      <button
        type="button"
        onClick={() => setShowNewPatientFields(false)} // Masque les champs
        className="cancel-add-patient-btn" // Nouvelle classe pour styliser
      >
        Annuler l'ajout
      </button>
    </div>
  )}

  {/* Bouton principal pour programmer le rendez-vous (reste le même) */}
  <button onClick={scheduleAppointment}>Programmer</button>
</div>
        <Calendar
        onChange={handleDateTimeChange}
        value={date}
        locale="fr-FR"
        className="react-calendar"
      />
    </div>

    {/* Liste des rendez-vous pour la date sélectionnée */}
    <div className="appointments-list" ref={appointmentsRef}>
      <h3>Rendez-vous du {format(date, "dd/MM/yyyy")}</h3>
      
      {appointments.length === 0 ? (
        <p>Aucun rendez-vous pour cette date</p>
      ) : (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>N° Patient</th>
              <th>Téléphone</th>
              <th>Heure</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.flatMap((patient) =>
              patient.appointments
                .filter((appt) => {
                  const apptDate = new Date(appt.date);
                  return apptDate.toDateString() === date.toDateString();
                })
                .map((appt, index) => (
                  <tr key={`${patient._id}-${index}`} className="appointment-row">
                    <td>{patient.firstName} {patient.lastName}</td>
                    <td>{patient.patientNumber}</td>
                    <td>{patient.phoneNumber}</td>
                    <td>
                      <input
                        type="time"
                        value={appointmentTimes[appt._id] || ""}
                        onChange={(e) => {
                          const newTime = e.target.value;
                          setAppointmentTimes((prev) => ({
                            ...prev,
                            [appt._id]: newTime,
                          }));
                          const newDate = new Date(appt.date);
                          const [hours, minutes] = newTime.split(":");
                          newDate.setHours(hours);
                          newDate.setMinutes(minutes);
                          handleUpdateAppointmentTime(patient._id, appt._id, newDate);
                        }}
                      />
                    </td>
                    <td>
                      <button
                        className={patient.seen ? "btn-seen" : "btn-not-seen"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsSeen(patient._id);
                        }}
                      >
                        {patient.seen ? "Consulté ✅" : "En attente ❌"}
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-view-file"
                        onClick={() => handleViewPatientFile(patient._id)}
                      >
                        Voir le dossier
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      )}
    </div>
  </div>
);
};

export default AppointmentCalendar;