import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "date-fns";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [patientsToday, setPatientsToday] = useState(0);
  const [unconsultedPatientsToday, setUnconsultedPatientsToday] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const navigate = useNavigate();

  const { isAuthenticated, admin } = useContext(Context);
  console.log("DASHBOARD LOG: Component rendered. isAuthenticated:", isAuthenticated, "Admin data:", admin); // <<< AJOUTÉ

 if (!isAuthenticated) {
    console.log("DASHBOARD LOG: Not authenticated, redirecting to /login.");
    return <Navigate to={"/login"} />;
  }
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
   // Dans src/components/Dashboard.jsx

// ... (vos autres fonctions et états avant fetchData) ...

const fetchData = async () => {
  try {
    // Récupérer tous les patients
    const patientsResponse = await axios.get(
      "https://clinico-backend-final.onrender.com/api/v1/patient/patients",
      { withCredentials: true }
    );
    console.log("DASHBOARD LOG: Réponse Patients (tous) :", patientsResponse.data.patients.length);
    setTotalPatients(patientsResponse.data.patients.length);

    // Récupérer les rendez-vous du jour
    const today = new Date(); // 

    const startOfCurrentDayUTC = new Date(Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(), // Ceci prend le jour LOCAL de 'today'
        0, 0, 0, 0 // À minuit UTC
    ));

    const endOfCurrentDayUTC = new Date(Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1, 
        0, 0, 0, 0 
    ));

    
    const formattedDateForBackend = format(today, "yyyy-MM-dd");

    console.log("DASHBOARD LOG: Date locale actuelle (raw) :", today.toString());
    console.log("DASHBOARD LOG: Date formatée pour backend (YYYY-MM-DD) :", formattedDateForBackend);
    console.log("DASHBOARD LOG: Bornes de filtrage frontend (start UTC) :", startOfCurrentDayUTC.toISOString());
    console.log("DASHBOARD LOG: Bornes de filtrage frontend (end UTC) :", endOfCurrentDayUTC.toISOString());
    console.log("DASHBOARD LOG: URL de la requête by-date :", `https://clinico-backend-final.onrender.com/api/v1/patient/by-date?date=${formattedDateForBackend}`);
    
    const appointmentsResponse = await axios.get(
      `https://clinico-backend-final.onrender.com/api/v1/patient/by-date?date=${formattedDateForBackend}`,
      { withCredentials: true }
    );

    const patientsWithAppointmentsToday = appointmentsResponse.data.patients || [];
    
    console.log("DASHBOARD LOG: Patients AVEC RDV (réponse brute du backend) :", patientsWithAppointmentsToday.length);
    console.log("DASHBOARD LOG: Contenu patientsWithAppointmentsToday (réponse brute du backend) :", patientsWithAppointmentsToday);
    // --- FIN GESTION PRÉCISE DES DATES UTC ---


    const unconsultedCount = patientsWithAppointmentsToday.filter(
        patient => !patient.seen
    ).length;
    setUnconsultedPatientsToday(unconsultedCount);

    // Filter les rendez-vous côté client, en comparant les dates UTC avec les bornes UTC
    const allAppointments = patientsWithAppointmentsToday.flatMap(patient =>
        patient.appointments
            .filter(appt => {
                const apptDate = new Date(appt.date); // Date du RDV de la DB (est déjà un objet Date en UTC)
                
                // Compare la date UTC du RDV avec les bornes UTC du jour actuel de l'utilisateur
                const isSameDay = (
                    apptDate >= startOfCurrentDayUTC && apptDate < endOfCurrentDayUTC
                );
                
                console.log(`DASHBOARD LOG: Comparaison RDV ${apptDate.toISOString()} (DB UTC) avec [${startOfCurrentDayUTC.toISOString()} - ${endOfCurrentDayUTC.toISOString()}[. Match: ${isSameDay}`);
                return isSameDay;
            })
            .map(appt => ({
                // S'assurer d'inclure toutes les infos nécessaires pour le tableau
                ...appt,
                patientId: patient._id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                phoneNumber: patient.phoneNumber,
                seen: patient.seen
            }))
    );

    const sortedAppointments = allAppointments.sort((a, b) => new Date(a.date) - new Date(b.date));

    console.log("DASHBOARD LOG: RDV filtrés et triés pour affichage sur Dashboard :", sortedAppointments.length);
    console.log("DASHBOARD LOG: Contenu sortedAppointments (prêt à afficher) :", sortedAppointments);

    setAppointments(sortedAppointments);
    setPatientsToday(sortedAppointments.length); // Met à jour le nombre total de RDV du jour

  } catch (error) {
    console.error("DASHBOARD LOG: Erreur lors du chargement des données (catch):", error.response?.data?.message || error.message);
    console.error("DASHBOARD LOG: Détails de l'erreur complète:", error);
    setAppointments([]);
    setPatientsToday(0);
    setUnconsultedPatientsToday(0);
  }
};
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleUpdateStatus = async (patientId, newStatus) => {
    try {
      await axios.put(
        `https://clinico-backend-final.onrender.com/api/v1/patient/mark-seen/${patientId}`,
        { seen: newStatus === "Vu" },
        { withCredentials: true }
      );
      toast.success("Statut mis à jour");
     
      // Mettre à jour le state local
      setAppointments(prev =>
        prev.map(appt =>
          appt.patientId === patientId
            ? { ...appt, seen: newStatus === "Vu" }
            : appt
        )
      );

      // Recalculer le nombre de patients non consultés
      const updatedAppointments = appointments.map(appt =>
        appt.patientId === patientId
          ? { ...appt, seen: newStatus === "Vu" }
          : appt
      );
      const unconsulted = updatedAppointments.filter(appt => !appt.seen).length;
      setUnconsultedPatientsToday(unconsulted);

    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Échec de la mise à jour du statut");
    }
  };

  const handleUpdateAppointmentTime = async (patientId, appointmentId, newDate) => {
    try {
      await axios.put(
        "https://clinico-backend-final.onrender.com/api/v1/patient/update-appointment-time",
        {
          patientId,
          appointmentId,
          newAppointmentDate: newDate.toISOString(),
        },
        { withCredentials: true }
      );
      toast.success("Heure du rendez-vous mise à jour");
     
      // Recharger les données après la mise à jour
      const today = new Date();
      const appointmentsResponse = await axios.get(
        `https://clinico-backend-final.onrender.com/api/v1/patient/by-date?date=${today.toISOString()}`,
        { withCredentials: true }
      );
     
      const patientsWithAppointmentsToday = appointmentsResponse.data.patients || [];
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const allAppointments = patientsWithAppointmentsToday.flatMap(patient =>
        patient.appointments
          .filter(appt => {
            const apptDate = new Date(appt.date);
            return apptDate >= startOfDay && apptDate <= endOfDay;
          })
          .map(appt => ({
            ...appt,
            patientId: patient._id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            phoneNumber: patient.phoneNumber,
            seen: patient.seen
          }))
      );

      const sortedAppointments = allAppointments.sort((a, b) =>
        new Date(a.date) - new Date(b.date)
      );

      setAppointments(sortedAppointments);
     
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'heure:", error);
      toast.error("Échec de la mise à jour de l'heure du rendez-vous");
    }
  };

  if (!isAuthenticated) {
    console.log("DASHBOARD LOG: Non authentifié, redirection vers /login.");
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="dashboard page">
      <div className="banner">
        <div className="firstBox">
          <div className="content">
            <div>
              <p>Bonjour Dr,</p>
              <h5>{admin && `${admin.lastName} ${admin.firstName}`}</h5>
            </div>
            <p>{format(currentDateTime, "dd/MM/yyyy HH:mm:ss")}</p>
          </div>
        </div>

        <div className="secondBox" onClick={() => navigate("/patients")} style={{ cursor: "pointer" }}>
          <p>Nombre total de patients inscrits au cabinet :</p>
          <h3>{totalPatients}</h3>
          <h5>voir plus...</h5>
        </div>

        <div className="thirdBox" onClick={() => navigate("/calendar")} style={{ cursor: "pointer" }}>
          <p>Nombre total de rendez-vous aujourd'hui :</p>
          <h3>{patientsToday}</h3>
          <h5>voir plus...</h5>
        </div>

        <div
          className="fourthBox"
          style={{ cursor: "pointer" }}
          onClick={() => {
            const element = document.getElementById('today-appointments');
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <p>Patients restant à consulter aujourd'hui :</p>
          <h3>{unconsultedPatientsToday}</h3>
          <h5>Patients en attente</h5>
        </div>
      </div>

      <div className="appointments-section" id="today-appointments">
        <h5 className="appointments-title">Rendez-vous du jour</h5>
        <div className="banner">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Heure</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <tr key={`${appointment.patientId}-${appointment.date}`}>
                    <td>{`${appointment.firstName} ${appointment.lastName}`}</td>
                    <td>
                      <input
                        type="time"
                        defaultValue={format(new Date(appointment.date), "HH:mm")}
                        onChange={(e) => {
                          const newTime = e.target.value;
                          const newDate = new Date(appointment.date);
                          const [hours, minutes] = newTime.split(":");
                          newDate.setHours(hours);
                          newDate.setMinutes(minutes);
                          handleUpdateAppointmentTime(appointment.patientId, appointment._id, newDate);
                        }}
                      />
                    </td>
                    <td>{appointment.phoneNumber}</td>
                    <td>
                      <select
                        className={appointment.seen ? "value-Vu" : "value-En attente"}
                        value={appointment.seen ? "Vu" : "En attente"}
                        onChange={(e) => handleUpdateStatus(appointment.patientId, e.target.value)}
                      >
                        <option value="En attente" className="value-En attente">
                          En attente ❌
                        </option>
                        <option value="Vu" className="value-Vu">
                          Consulté ✅
                        </option>
                      </select>
                    </td>
                    <td>
                      <button onClick={() => navigate(`/dossier-patient/${appointment.patientId}`)}>
                        Consulter Dossier
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">Aucun rendez-vous aujourd'hui</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;