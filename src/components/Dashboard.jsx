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
  const [unconsultedPatientsToday, setUnconsultedPatientsToday] = useState(0); // Nouvel état ajouté
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const navigate = useNavigate();

  const { isAuthenticated, admin } = useContext(Context);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer tous les patients
        const patientsResponse = await axios.get(
          "https://clinico-backend-final.onrender.com/api/v1/patient/patients",
          { withCredentials: true }
        );
        setTotalPatients(patientsResponse.data.patients.length);

        // Récupérer les rendez-vous du jour
        const today = new Date();
today.setHours(0, 0, 0, 0); // Début de la journée
const endOfDay = new Date(today);
endOfDay.setHours(23, 59, 59, 999); // Fin de la journée

const appointmentsResponse = await axios.get(
  `https://clinico-backend-final.onrender.com/api/v1/patient/by-date?date=${format(today, "yyyy-MM-dd")}`,
  { withCredentials: true }
);

// ... puis l'aplatissement et le tri ...
const allAppointments = patientsWithAppointmentsToday.flatMap(patient =>
  patient.appointments
    .filter(appt => {
        const apptDate = new Date(appt.date); // Date du RDV de la DB (UTC)
        const today = new Date(); // Date locale actuelle

        // Comparez UNIQUEMENT l'année, le mois et le jour en UTC
        return (
            apptDate.getUTCFullYear() === today.getUTCFullYear() &&
            apptDate.getUTCMonth() === today.getUTCMonth() &&
            apptDate.getUTCDate() === today.getUTCDate()
        );
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
setAppointments(sortedAppointments);
setPatientsToday(sortedAppointments.length);

      } catch (error) {
        toast.error("Erreur de chargement des données");
        setAppointments([]);
        setPatientsToday(0);
        setUnconsultedPatientsToday(0);
      }
    };
   if (isAuthenticated) { // <<< NE CHARGE LES DONNÉES QUE SI L'UTILISATEUR EST AUTHENTIFIÉ
        fetchData();
    }
  }, [isAuthenticated]);

  const handleUpdateStatus = async (patientId, newStatus) => {
    try {
      await axios.put(
        `https://clinico-backend-final.onrender.com/api/v1/patient/mark-seen/${patientId}`,
        { seen: newStatus === "Vu" },
        
      );
      toast.success("Statut mis à jour");
      setUnconsultedPatientsToday(prev => newStatus === "Vu" ? prev - 1 : prev + 1);
      setAppointments(prev => 
        prev.map(appt => 
          appt.patientId === patientId 
            ? { ...appt, seen: newStatus === "Vu" } 
            : appt
        )
      );
    } catch (error) {
      toast.error("Échec de la mise à jour du statut");
    }
  };

  // handleUpdateAppointmentTime reste identique...

  if (!isAuthenticated) {
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

        {/* Nouvelle quatrième boîte ajoutée ici */}
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