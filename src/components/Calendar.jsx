import React, { useState, useEffect, useRef } from "react";
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
// Dans Calendar.jsx
// ...
const fetchAppointments = async (selectedDate) => {
  console.log("CALENDAR: Requête RDV pour date:", selectedDate.toISOString()); // <<< AJOUTÉ
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/by-date?date=${format(selectedDate, "yyyy-MM-dd")}`,
      { withCredentials: true }
    );
    console.log("CALENDAR: Réponse RDV (patients trouvés):", response.data.patients.length); // <<< AJOUTÉ
    if (response.data.patients.length > 0) { // <<< AJOUTÉ
        response.data.patients.forEach(p => { // <<< AJOUTÉ
            console.log(`CALENDAR: RDV patient: ${p.firstName} ${p.lastName}, RDV dates: ${p.appointments.map(a => new Date(a.date).toISOString())}`); // <<< AJOUTÉ
        }); // <<< AJOUTÉ
    } // <<< AJOUTÉ
    setAppointments(response.data.patients);
    console.log("CALENDAR PAGE LOG: Réponse réussie, RDV reçus:", response.data.length);
  } catch (error) {
    console.error("CALENDAR ERREUR fetchAppointments:", error.response?.data?.message || error.message); // <<< AJOUTÉ
    console.error("CALENDAR PAGE LOG: Détails de l'erreur complète:", error); 
    toast.error("Erreur lors du chargement des rendez-vous");
  }
};

const fetchAllPatients = async () => {
  console.log("CALENDAR: Requête tous les patients."); // <<< AJOUTÉ
  try {
    const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/patients`,
      {withCredentials: true }
    );
    console.log("CALENDAR: Réponse tous les patients:", response.data.patients.length); // <<< AJOUTÉ
    setPatients(response.data.patients);
  } catch (error) {
    console.error("CALENDAR ERREUR fetchAllPatients:", error.response?.data?.message || error.message); // <<< AJOUTÉ
    console.error("CALENDAR DÉTAILS ERREUR PATIENTS:", error); // <<< AJOUTÉ
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

  if (selectedPatient === "new") {
      // ... (Validation des champs du nouveau patient : newPatientFirstName, etc.) ...

      try {
          // 2. Créer le nouveau patient via l'API (cette partie est déjà là)
          const newPatientData = new FormData();
          newPatientData.append("firstName", newPatientFirstName);
          newPatientData.append("lastName", newPatientLastName);
          newPatientData.append("phoneNumber", newPatientPhoneNumber);

          const response = await axios.post(
              `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/addnew`,
              newPatientData,
              {
                  headers: { "Content-Type": "multipart/form-data" },
                  withCredentials: true,
              }
          );
          // <<< MODIFICATION CRUCIALE ICI : Mettre à jour patientIdToSchedule avec l'ID du nouveau patient
          patientIdToSchedule = response.data.patient._id; // <-- C'EST CETTE LIGNE QUI FAIT LE LIEN
          toast.success("Nouveau patient ajouté avec succès et rendez-vous en cours !"); // Message mis à jour

          // Réinitialiser les champs du nouveau patient pour vider le formulaire
          setNewPatientFirstName("");
          setNewPatientLastName("");
          setNewPatientPhoneNumber("");
          setShowNewPatientFields(false); // Masquer les champs après l'ajout
          setSelectedPatient(""); // Réinitialiser la sélection

          // REMARQUE : fetchAllPatients() est important pour que le nouveau patient apparaisse
          // dans le sélecteur la prochaine fois, mais il ne bloque pas le flux ici.
          fetchAllPatients();

      } catch (error) {
          toast.error(error.response?.data?.message || "Erreur lors de l'ajout du nouveau patient.");
          console.error(error);
          return; // Arrêter la fonction si l'ajout du patient échoue
      }
  }

  // Si aucun patient n'est sélectionné OU si le nouvel ajout a échoué (patientIdToSchedule sera toujours "new")
  if (!patientIdToSchedule || patientIdToSchedule === "new") {
      toast.error("Veuillez sélectionner un patient ou corriger les informations du nouveau patient.");
      return;
  }

  // 3. Programmer le rendez-vous (utilise maintenant l'ID du nouveau patient si applicable)
  try {
      const [hours, minutes] = time.split(":");
      const appointmentDate = new Date(date);
      appointmentDate.setHours(hours);
      appointmentDate.setMinutes(minutes);

      const response = await axios.put(
          `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/schedule-appointment`,
          {
              patientId: patientIdToSchedule, // <<< UTILISE L'ID DU NOUVEAU PATIENT OU DE L'EXISTANT
              appointmentDate: appointmentDate.toISOString(),
          },
          { withCredentials: true }
      );

      toast.success("Rendez-vous programmé avec succès !"); // Message mis à jour
      fetchAppointments(date); // Recharger les rendez-vous pour la date actuelle
      // REMARQUE : Pour que le Dashboard se rafraîchisse, il faudra un `Maps("/")` après ça.
      // Si vous voulez une redirection, placez-la ici : navigate("/");
  } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la programmation du rendez-vous.");
      console.error(error);
  }
};

  // Fonction pour marquer un patient comme "Vu"
  const handleMarkAsSeen = async (patientId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/mark-seen/${patientId}`,
        {}, // Corps de la requête
        { withCredentials: true } // Configuration de la requête
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
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/update-appointment-time`,
        { // Corps de la requête
            patientId,
            appointmentId,
            newAppointmentDate: newAppointmentDate.toISOString(),
        },
        { withCredentials: true } // Configuration de la requête
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

  return (
    <div className="calendar-container">
      <h2>Calendrier des Rendez-vous</h2>

      {/* Container pour calendrier + formulaire côte à côte */}
      <div className="calendar-form-container">
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
            <div className="new-patient-fields-container">
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
          calendarType="gregory"
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
