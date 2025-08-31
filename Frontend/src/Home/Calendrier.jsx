import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import "../assets/styles/calendrier.css";

const Calendrier = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const selectedDate = date.toLocaleDateString("fr-CA");
        console.log("la date selectionner est : ", selectedDate);
        const response = await axios.get(`${apiUrl}/lead/taches/${selectedDate}/`, { 
            headers: { 
                'Content-Type': "application/json",
                Authorization: `Bearer ${token}`
         } });
        const rappels = response.data.rappels.map(r => ({ ...r, type: "rappel" }));
        const rdvs = response.data.rdvs.map(r => ({ ...r, type: "rdv" }));

        setTasks([...rappels, ...rdvs]);
      } catch (error) {
        console.error("Erreur lors du chargement des tâches :", error);
      }
    };

    fetchTasks();
  }, [date]);

  return (
    <div className="calendrier-container">
      <div className="calendar-section">
        <h2>Tâche d'aujourd'hui</h2>
        <Calendar onChange={setDate} value={date} />
      </div>
      
      <div className="tasks-section">
        <div className="task-column">
          {/* Rappels */}
          {tasks.filter(task => task.type === "rappel").length > 0 && (
            <>
              <h4>Leads à rappeler:</h4>
              <ul className="task-list">
                {tasks
                  .filter(task => task.type === "rappel")
                  .map((task, index) => (
                    <li key={index} className="task-item">
                      <p>
                        <strong>⏰</strong>{" "}
                        {new Date(task.date_rappel).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p>
                        <strong>📌</strong> {task.motif}
                      </p>
                      <p>
                        <strong>👤</strong> {task.lead_nom} {task.lead_prenom}
                      </p>
                    </li>
                ))}
              </ul>
            </>
          )}
        </div>
        
        <div className="task-column">
          {/* RDVs */}
          {tasks.filter(task => task.type === "rdv").length > 0 && (
            <>
              <h4>RDVs :</h4>
              <ul className="task-list">
                {tasks
                  .filter(task => task.type === "rdv")
                  .map((task, index) => (
                    <li key={index} className="task-item">
                      <p>
                        <strong>⏰</strong>{" "}
                        {new Date(task.date_rdv).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <p>
                        <strong>📌</strong> Rendez-vous
                      </p>
                      <p>
                        <strong>👤</strong> {task.lead_nom} {task.lead_prenom}
                      </p>
                    </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
      
      {tasks.length === 0 && <p className="no-task">Aucune tâche prévue pour cette date.</p>}
    </div>
  );
};

export default Calendrier;