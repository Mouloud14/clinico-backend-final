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
  const [showNewPatientFields, setShowNewPatientFields] = useState(false);
  const [emailReminderActive, setEmailReminderActive] = useState(false);
  const [emailReminderTimeOption, setEmailReminderTimeOption] = useState('24h-before');
  const [customReminderDateTime, setCustomReminderDateTime] = useState('');


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
    console.log("CALENDAR: Requête RDV pour date:", selectedDate.toISOString());
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/by-date?date=${format(selectedDate, "yyyy-MM-dd")}`,
        { withCredentials: true }
      );
      console.log("CALENDAR: Réponse RDV (patients trouvés):", response.data.patients.length);
      if (response.data.patients.length > 0) {
        response.data.patients.forEach(p => {
          console.log(`CALENDAR: RDV patient: ${p.firstName} ${p.lastName}, RDV dates: ${p.appointments.map(a => new Date(a.date).toISOString())}`);
        });
      }
      setAppointments(response.data.patients || []);
      console.log("CALENDAR PAGE LOG: Réponse réussie, nombre de patients avec RDV reçus:", response.data.patients ? response.data.patients.length : 0);
      console.log("CALENDAR PAGE LOG: Contenu patients reçus:", response.data.patients || []);
    } catch (error) {
      console.error("CALENDAR ERREUR fetchAppointments:", error.response?.data?.message || error.message);
      console.error("CALENDAR PAGE LOG: Détails de l'erreur complète:", error);
      toast.error("Erreur lors du chargement des rendez-vous");
    }
  };

  const fetchAllPatients = async () => {
    console.log("CALENDAR: Requête tous les patients.");
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/patients`,
        { withCredentials: true }
      );
      console.log("CALENDAR: Réponse tous les patients:", response.data.patients.length);
      setPatients(response.data.patients);
    } catch (error) {
      console.error("CALENDAR ERREUR fetchAllPatients:", error.response?.data?.message || error.message);
      console.error("CALENDAR DÉTAILS ERREUR PATIENTS:", error);
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

      const appointmentData = {
        patientId: patientIdToSchedule,
        appointmentDate: appointmentDate.toISOString(),
        // Ajoutez les options de rappel :
        emailReminderActive: emailReminderActive,
        emailReminderTime: emailReminderActive && emailReminderTimeOption !== 'manual-now' ? emailReminderTimeOption : null, // Envoyer si actif ET pas 'manual-now'
        customReminderDate: emailReminderActive && emailReminderTimeOption === 'custom-date' ? customReminderDateTime : null, // Envoyer si activé ET option 'custom-date'
      };

      const response = await axios.put( // OU POST, selon votre route de création/mise à jour de RDV
        `${import.meta.env.VITE_REACT_APP_API_URL}/api/v1/patient/schedule-appointment`, // Adaptez votre route
        appointmentData, // <<< ENVOYER L'OBJET AVEC LES NOUVELLES OPTIONS
        { withCredentials: true }
      );

      toast.success("Rendez-vous programmé avec succès !"); // Message mis à jour
      fetchAppointments(date); // Recharger les rendez-vous pour la date actuelle

      // Optionnel : Si vous voulez déclencher l'envoi immédiat du rappel
      if (emailReminderActive && emailReminderTimeOption === 'manual-now') {
        console.log("CALENDAR: Déclenchement de l'envoi immédiat du rappel...");
        
        toast.info("Rappel manuel en cours d'envoi...");
      }

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

      {/* Container principal pour aligner le formulaire de rendez-vous et le calendrier.
        Ces deux éléments seront des enfants directs de ce div.
      */}
      <div className="calendar-form-container">

        {/* DÉBUT DU FORMULAIRE DE PROGRAMMATION DE RENDEZ-VOUS (le cadre vert).
          Tous les champs de saisie pour un nouveau rendez-vous, y compris les options de rappel,
          doivent se trouver à l'intérieur de ce div.
        */}
        <div className="appointment-form">
          <h3>Programmer un nouveau rendez-vous</h3>

          {/* Container pour la checkbox "Activer le rappel" et le sélecteur "Envoyer le rappel".
            Ils sont ici car ils font partie des options de programmation.
          */}
         
   <div class="form-row-inline">
  {/* Texte "Activer le rappel par e-mail" - mis dans un form-group pour alignement */}
  <div class="form-group" > {/* Permet au texte de pousser le switch à droite */}
    <span class="checkbox-label-text">ACTIVER LE RAPPEL PAR E-MAIL</span>
  </div>

  {/* Le nouveau bouton bascule (Toggle Switch) */}
  <div class="form-group"> {/* Ce form-group contient le switch lui-même */}
    <label class="toggle-switch">
      {/* Le vrai input checkbox, il sera caché et gérera l'état */}
      <input
        type="checkbox"
        className="toggle-switch-checkbox"
        checked={emailReminderActive}
        onChange={(e) => setEmailReminderActive(e.target.checked)}
      />
      {/* Le "slider" est la partie visuelle du bouton bascule */}
      <span class="toggle-switch-slider round"></span>
    </label>
  </div>

  {/* Le reste de form-row-inline pour le sélecteur "Envoyer le rappel" */}
  {emailReminderActive && (
    <div class="form-group inline-select-group">
      <label htmlFor="reminderTimeOption">Envoyer le rappel :</label>
      <select
        id="reminderTimeOption"
        value={emailReminderTimeOption}
        onChange={(e) => {
          setEmailReminderTimeOption(e.target.value);
          if (e.target.value !== 'custom-date') {
            setCustomReminderDateTime('');
          }
        }}
      >
        <option value="24h-before">24 heures avant le RDV</option>
        <option value="custom-date">À une date/heure spécifique</option>
      </select>
    </div>
  )}

          </div>

          {/* Le champ de date et heure personnalisée.
            Il est ici, directement après les options de rappel, car il en dépend.
            C'était l'élément mal placé dans tes versions précédentes.
          */}
          {emailReminderActive && emailReminderTimeOption === 'custom-date' && (
            <div className="form-group">
              <label htmlFor="customReminderDate">Date et heure du rappel :</label>
              <input
                type="datetime-local"
                id="customReminderDate"
                value={customReminderDateTime}
                onChange={(e) => setCustomReminderDateTime(e.target.value)}
              />
            </div>
          )}
          {/* FIN DU BLOC DATE/HEURE CUSTOM */}

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
              type="button"
              onClick={() => {
                setShowNewPatientFields(true);
                setSelectedPatient("new");
              }}
              className="add-new-patient-btn"
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
                required={showNewPatientFields}
              />
              <input
                type="text"
                placeholder="Nom *"
                value={newPatientLastName}
                onChange={(e) => setNewPatientLastName(e.target.value)}
                className="appointment-form-input"
                required={showNewPatientFields}
              />
              <input
                type="text"
                placeholder="Numéro de téléphone *"
                value={newPatientPhoneNumber}
                onChange={(e) => setNewPatientPhoneNumber(e.target.value)}
                className="appointment-form-input"
                required={showNewPatientFields}
              />
              <button
                type="button"
                onClick={() => setShowNewPatientFields(false)}
                className="cancel-add-patient-btn"
              >
                Annuler l'ajout
              </button>
            </div>
          )}

          {/* Bouton principal pour programmer le rendez-vous */}
          <button onClick={scheduleAppointment}>Programmer</button>
        </div> {/* FIN DU FORMULAIRE DE PROGRAMMATION DE RENDEZ-VOUS */}

        {/* Le calendrier, autre enfant direct de calendar-form-container */}
        <Calendar
          onChange={handleDateTimeChange}
          value={date}
          locale="fr-FR"
          className="react-calendar"
          calendarType="gregory"
        />
      </div> {/* FIN DU calendar-form-container */}

      {/* Liste des rendez-vous pour la date sélectionnée (cet élément était déjà correctement placé) */}
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