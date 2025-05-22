import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-toastify";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";

const AppointmentCalendar = () => {
  const navigate = useNavigate(); // Pour la navigation entre les pages
  const [date, setDate] = useState(new Date()); // État pour la date sélectionnée dans le calendrier
  const [time, setTime] = useState("09:00"); // État pour l'heure sélectionnée
  const [appointments, setAppointments] = useState([]); // État pour stocker les rendez-vous
  const [patients, setPatients] = useState([]); // État pour stocker la liste des patients
  const [selectedPatient, setSelectedPatient] = useState(""); // État pour le patient sélectionné
  const [appointmentTimes, setAppointmentTimes] = useState({}); // État pour gérer les heures des rendez-vous

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
        `http://localhost:4000/api/v1/patient/by-date?date=${selectedDate.toISOString()}`,
        { withCredentials: true }
      );
      setAppointments(response.data.patients); // Mettre à jour l'état des rendez-vous
    } catch (error) {
      toast.error("Erreur lors du chargement des rendez-vous");
    }
  };

  // Fonction pour récupérer tous les patients
  const fetchAllPatients = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/v1/patient/patients",
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
  };

  // Fonction pour programmer un nouveau rendez-vous
  const scheduleAppointment = async () => {
    if (!selectedPatient) {
      toast.error("Veuillez sélectionner un patient.");
      return;
    }
  
    try {
      const [hours, minutes] = time.split(":");
      const appointmentDate = new Date(date);
      appointmentDate.setHours(hours);
      appointmentDate.setMinutes(minutes);
  
      const response = await axios.put(
        "http://localhost:4000/api/v1/patient/schedule-appointment",
        {
          patientId: selectedPatient,
          appointmentDate: appointmentDate.toISOString(),
        },
        { withCredentials: true }
      );
  
      toast.success("Rendez-vous programmé !");
      fetchAppointments(date); // Recharger les rendez-vous après la programmation
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la programmation");
    }
  };
  
  // Fonction pour marquer un patient comme "Vu"
  const handleMarkAsSeen = async (patientId) => {
    try {
      await axios.put(
        `http://localhost:4000/api/v1/patient/mark-seen/${patientId}`,
        {},
        { withCredentials: true }
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
        "http://localhost:4000/api/v1/patient/update-appointment-time",
        {
          patientId,
          appointmentId,
          newAppointmentDate: newAppointmentDate.toISOString(),
        },
        { withCredentials: true }
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

      {/* Calendrier pour sélectionner une date */}
      <Calendar
        onChange={handleDateTimeChange}
        value={date}
        locale="fr-FR"
        className="react-calendar"
      />

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

        {/* Sélection du patient */}
        <select
          onChange={(e) => setSelectedPatient(e.target.value)}
          value={selectedPatient}
        >
          <option value="">Sélectionner un patient</option>
          {patients.map((patient) => (
            <option key={patient._id} value={patient._id}>
              {patient.firstName} {patient.lastName} (N°{patient.patientNumber})
            </option>
          ))}
        </select>

        {/* Bouton pour programmer le rendez-vous */}
        <button onClick={scheduleAppointment}>Programmer</button>
      </div>

      {/* Liste des rendez-vous pour la date sélectionnée */}
      {/* Remplacer la section appointments-list par : */}
<div className="appointments-list">
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