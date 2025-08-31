import React, { useState, useEffect } from 'react';
import { FaCheck, FaTrash, FaCheckDouble, FaBell } from 'react-icons/fa';
import NavbarNotif from './NavbarNotif';
import NavbarLead from '../Lead/NavbarLead';

const NotificationsPage = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0); // Ajoutez cet état

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
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
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.lu).length); // Mettez à jour le compteur
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour déclencher la mise à jour globale
  const triggerGlobalUpdate = () => {
    // Créer un événement personnalisé pour notifier les autres composants
    const event = new CustomEvent('notificationUpdated');
    window.dispatchEvent(event);
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiUrl}/notifications/${id}/marquer-lue/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const updatedNotifications = notifications.map(notif => 
          notif.id === id ? { ...notif, lu: true } : notif
        );
        setNotifications(updatedNotifications);
        setUnreadCount(updatedNotifications.filter(n => !n.lu).length); // Mettez à jour le compteur
        triggerGlobalUpdate();
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lue:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiUrl}/${id}/supprimer/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const updatedNotifications = notifications.filter(notif => notif.id !== id);
        setNotifications(updatedNotifications);
        setUnreadCount(updatedNotifications.filter(n => !n.lu).length); // Mettez à jour le compteur
        triggerGlobalUpdate();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiUrl}/marquer-toutes-lues/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setNotifications(notifications.map(notif => ({ ...notif, lu: true })));
        setUnreadCount(0); // Réinitialisez le compteur à 0
        triggerGlobalUpdate();
      }
    } catch (error) {
      console.error('Erreur lors du marquage de toutes comme lues:', error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <>
    <NavbarLead titre="Notification" />
    <div className="container-fluid mt-3">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              {/* <h2>Notifications</h2> */}
              <p className="text-muted mb-0">
                {notifications.filter(n => !n.lu).length} non lues sur {notifications.length} total
              </p>
            </div>
            {notifications.some(n => !n.lu) && (
              <button 
                onClick={markAllAsRead}
                className="btn btn-outline-primary btn-sm"
              >
                <FaCheckDouble className="me-2" />
                Marquer toutes comme lues
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-5">
              <FaBell className="fs-1 text-muted mb-3" />
              <h5 className="text-muted">Aucune notification</h5>
              <p className="text-muted">Vous n'avez pas encore de notifications</p>
            </div>
          ) : (
            <div className="row">
              {notifications.map((notification) => (
                <div key={notification.id} className="col-12 mb-3">
                  <div className={`card ${!notification.lu ? 'border-primary' : ''}`}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <h6 className={`card-title ${!notification.lu ? 'fw-bold' : ''}`}>
                            {notification.titre}
                          </h6>
                          <p className="card-text">{notification.message}</p>
                          <small className="text-muted">
                            {new Date(notification.date_creation).toLocaleString('fr-FR')}
                          </small>
                        </div>
                        <div className="d-flex gap-2">
                          {!notification.lu && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="btn btn-outline-success btn-sm"
                              title="Marquer comme lue"
                            >
                              <FaCheck />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="btn btn-outline-danger btn-sm"
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default NotificationsPage;