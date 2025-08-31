import {React, useState, useEffect} from "react";
import "../assets/styles/navbarLead.css";
import axios from "axios";
import logo from "../assets/logo/profil.jpeg";
import { IoNotificationsOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const NavbarLead = ({ titre, onRefresh }) => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0); // Ajoutez cet état
    const [ lead, setLead] = useState([]);
    useEffect(() => {
      const token = localStorage.getItem("access_token");
      const id_user = localStorage.getItem("id_user")
      const res = axios.get(`${apiUrl}/utilisateur/user/${id_user}/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => setLead(res.data))
      .catch(error => console.error(error));
      
    }, []);

   

    const fetchUnreadCount = async () => {
        try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${apiUrl}/notifications/`, {
            headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            },
        });
        
        if (response.ok) {
            const data = await response.json();
            const unread = data.filter(n => !n.lu).length;
            setUnreadCount(unread);
        }
        } catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
        }
    };

    useEffect(() => {
      // Récupérer immédiatement
      fetchUnreadCount();
      
      // Mettre en place un intervalle pour rafraîchir automatiquement
    //   const interval = setInterval(fetchUnreadCount, 30000); // Toutes les 30 secondes
      
    //   // Nettoyer l'intervalle quand le composant est démonté
    //   return () => clearInterval(interval);
    }, []);


    // Effet qui écoute les changements de onRefresh
    useEffect(() => {
        if (onRefresh) {
        fetchUnreadCount();
        }
    }, [onRefresh]); // Se déclenche quand onRefresh change

    // Écouter les événements de mise à jour des notifications
    useEffect(() => {
      const handleNotificationUpdate = () => {
        fetchUnreadCount();
      };
      
      // Écouter les événements personnalisés
      window.addEventListener('notificationUpdated', handleNotificationUpdate);
      
      return () => {
        window.removeEventListener('notificationUpdated', handleNotificationUpdate);
      };
    }, []);

    
    return (
        <>
            {/* <div className="d-flex justify-content-between align-items-center navbarLead">
                <h5 className="navbar-titre">{titre}</h5>
                <div className="navbar-btn d-flex justify-content-end align-items-center">
                    <button className="btn-light btn" style={{fontSize: "20px"}} onClick={()=> navigate("../notifications")}><IoNotificationsOutline /></button>
                    <div className="vertical-line"></div>
                    
                    <div className="user">
                        <img src={logo} className="image-profile"/>
                        <p>
                            {lead.nom + ' ' + lead.prenom}
                            <br />
                            <span>{lead.role}</span>
                        </p>
                    </div>
                </div>
            </div> */}

            <div className="d-flex justify-content-between align-items-center navbarLead">
                <h5 className="navbar-titre">{titre}</h5>
                <div className="navbar-btn d-flex justify-content-end align-items-center">
                    <button 
                    className={`btn btn-light notification-btn ${unreadCount > 0 ? 'has-notifications' : ''}`} 
                    onClick={() => navigate("../notifications")}
                    style={{ position: 'relative' }}
                    >
                    <IoNotificationsOutline />
                    {unreadCount > 0 && (
                        <span className="notification-badge">
                        {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                    </button>
                    <div className="vertical-line"></div>
                    <div className="user">
                    <img src={logo} className="image-profile"/>
                    <p>
                        {lead.nom + ' ' + lead.prenom}
                        <br />
                        <span>{lead.role}</span>
                    </p>
                    </div>
                </div>
            </div>
        </>
    )
};

export default NavbarLead;