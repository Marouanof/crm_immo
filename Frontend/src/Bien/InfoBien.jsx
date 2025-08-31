import React, { useState } from "react";
import "../assets/styles/ModalBien.css";

export default function InfoBien({ bien, onClose }) {
  const [activeTab, setActiveTab] = useState("general");
  
  if (!bien) return null;

  const renderContent = () => {
    switch(activeTab) {
      case "general":
        return (
          <div className="tab-content">
            <div className="info-card">
              <div className="card-icon">🏠</div>
              <div>
                <h4>Type de bien</h4>
                <p>{bien.type_bien}</p>
              </div>
            </div>
            
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Référence</span>
                <span className="info-value highlight">{bien.reference}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Transaction</span>
                <span className={`info-value tag ${bien.type_transaction?.toLowerCase()}`}>
                  {bien.type_transaction}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Surface</span>
                <span className="info-value">{bien.superficie} m²</span>
              </div>
              <div className="info-item">
                <span className="info-label">Chambres</span>
                <span className="info-value">{bien.nbr_chambre}</span>
              </div>
            </div>
          </div>
        );
      
      case "localisation":
        return (
          <div className="tab-content">
            <div className="map-preview">
              <div className="map-placeholder">
                🗺️
                <p>Aperçu de la localisation</p>
              </div>
            </div>
            
            <div className="location-details">
              <div className="location-item">
                <span className="location-icon">📍</span>
                <div>
                  <p className="location-address">{bien.adresse}</p>
                  <p className="location-area">{bien.quartier}, {bien.ville}</p>
                </div>
              </div>
              
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${bien.adresse}, ${bien.quartier}, ${bien.ville}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="map-button"
              >
                📍 Ouvrir dans Google Maps
              </a>
            </div>
          </div>
        );
      
      case "contacts":
        return (
          <div className="tab-content">
            <div className="contact-card">
              <div className="contact-avatar">
                {bien.prop_nom?.[0]}{bien.prop_prenom?.[0]}
              </div>
              <div className="contact-info">
                <h4>{bien.prop_nom} {bien.prop_prenom}</h4>
                <p className="contact-role">Propriétaire</p>
                <a href={`tel:${bien.prop_telephone}`} className="contact-phone">
                  📞 {bien.prop_telephone}
                </a>
              </div>
            </div>
            
            <div className="contact-card">
              <div className="contact-avatar agent">
                {bien.responsable_nom?.[0]}{bien.responsable_prenom?.[0]}
              </div>
              <div className="contact-info">
                <h4>{bien.responsable_nom} {bien.responsable_prenom}</h4>
                <p className="contact-role">Responsable commercial</p>
              </div>
            </div>
          </div>
        );
      
      case "statut":
        return (
          <div className="tab-content">
            <div className="status-cards">
              <div className="status-card">
                <div className="status-icon">📊</div>
                <div>
                  <p className="status-label">Statut commercial</p>
                  <p className={`status-value ${bien.statut_commercial?.toLowerCase()}`}>
                    {bien.statut_commercial}
                  </p>
                </div>
              </div>
              
              <div className="status-card">
                <div className="status-icon">⭐</div>
                <div>
                  <p className="status-label">Degré d'importance</p>
                  <p className={`importance-level level-${bien.degre_importance?.toLowerCase()}`}>
                    {bien.degre_importance}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="price-display">
              <div className="price-label">Prix</div>
              <div className="price-amount">{bien.prix} DH</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="modal-overlay creative" onClick={onClose}>
      <div className="modal-content-creative" onClick={(e) => e.stopPropagation()}>
        
        {/* Header avec image de fond */}
        <div className="modal-header-creative">
          <div className="header-overlay">
            <h1 className="property-title">{bien.titre || "Détails du bien"}</h1>
            <p className="property-reference">Ref: {bien.reference}</p>
          </div>
          <button className="modal-close-creative" onClick={onClose}>
            <span>×</span>
          </button>
        </div>

        {/* Navigation par onglets */}
        <div className="modal-tabs">
          <button 
            className={`tab-button ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            🏠 Général
          </button>
          <button 
            className={`tab-button ${activeTab === "localisation" ? "active" : ""}`}
            onClick={() => setActiveTab("localisation")}
          >
            📍 Localisation
          </button>
          <button 
            className={`tab-button ${activeTab === "contacts" ? "active" : ""}`}
            onClick={() => setActiveTab("contacts")}
          >
            👥 Contacts
          </button>
          <button 
            className={`tab-button ${activeTab === "statut" ? "active" : ""}`}
            onClick={() => setActiveTab("statut")}
          >
            📊 Statut
          </button>
        </div>

        {/* Contenu principal */}
        <div className="modal-body-creative">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
