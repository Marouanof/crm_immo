import React, { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const NotificationButton = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [notificationCount, setNotificationCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [lastCount, setLastCount] = useState(0);

  useEffect(() => {
    fetchNotificationCount();
    // Rafraîchir le compteur toutes les 30 secondes
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Afficher un toast si le nombre de notifications a augmenté
    if (notificationCount > lastCount && lastCount > 0) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
    setLastCount(notificationCount);
  }, [notificationCount, lastCount]);

  const fetchNotificationCount = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiUrl}/notifications/non-lues/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotificationCount(data.count);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    }
  };

  return (
    <>
      <Link
        to="/notifications"
        className="nav-link text-black d-flex align-items-center rounded py-2 px-3 hover-bg-primary position-relative"
        style={{ height: "50px" }}
      >
        <FaBell className="me-3 fs-5" />
        Notifications
        {notificationCount > 0 && (
          <span className="notification-badge">
            {notificationCount > 99 ? '99+' : notificationCount}
          </span>
        )}
      </Link>

      {/* Toast de notification */}
      {showToast && (
        <div 
          className="position-fixed top-0 end-0 p-3"
          style={{ zIndex: 1050, marginTop: '80px', marginRight: '20px' }}
        >
          <div className="toast show" role="alert">
            <div className="toast-header bg-success text-white">
              <FaBell className="me-2" />
              <strong className="me-auto">Nouvelle notification</strong>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowToast(false)}
              ></button>
            </div>
            <div className="toast-body">
              Vous avez reçu une nouvelle notification !
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationButton;
