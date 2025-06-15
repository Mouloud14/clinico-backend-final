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
       
        const appointmentsResponse = await axios.get(
          `https://clinico-backend-final.onrender.com/api/v1/patient/by-date?date=${today.toISOString()}`,
          { withCredentials: true }
        );

        // Traitement des données des rendez-vous
        const patientsWithAppointmentsToday = appointmentsResponse.data.patients || [];
       
        // Début et fin de la journée pour le filtrage
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        // Aplatir et filtrer les rendez-vous du jour
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

        // Trier les rendez-vous par heure
        const sortedAppointments = allAppointments.sort((a, b) =>
          new Date(a.date) - new Date(b.date)
        );

        setAppointments(sortedAppointments);
        setPatientsToday(sortedAppointments.length);
       
        // Compter les patients non consultés
        const unconsulted = sortedAppointments.filter(appt => !appt.seen).length;
        setUnconsultedPatientsToday(unconsulted);

      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Erreur de chargement des données");
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