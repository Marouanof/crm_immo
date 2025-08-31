import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../assets/styles/infoLead.css";

function LeadInfo() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const response = await axios.get(`${apiUrl}lead/lead/${id}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setLead(response.data);
      } catch (err) {
        setError("Erreur lors du chargement des informations du lead.");
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id]);

  const getStatusBadge = (statut) => {
    const statusConfig = {
      'nouveau': { class: 'status-new', icon: '🆕', label: 'Nouveau' },
      'affecté': { class: 'status-contacted', icon: '👤', label: 'Affecté' },
      'rdv planifié': { class: 'status-rdv', icon: '📅', label: 'RDV Planifié' },
      'a rappeler': { class: 'status-reminder', icon: '⏰', label: 'À rappeler' },
      'non relancé': { class: 'status-not-contacted', icon: '🔕', label: 'Non relancé' },
      'opportunité': { class: 'status-opportunity', icon: '💎', label: 'Opportunité' },
      'perdu': { class: 'status-lost', icon: '❌', label: 'Perdu' },
      'gagné': { class: 'status-won', icon: '✅', label: 'Gagné' }
    };
    
    const normalizedStatus = statut?.toLowerCase();
    return statusConfig[normalizedStatus] || { class: 'status-default', icon: '📋', label: statut };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) return (
    <div className="lead-loading">
      <div className="loading-spinner"></div>
      <p>Chargement des informations du lead...</p>
    </div>
  );
  
  if (error) return (
    <div className="lead-error">
      <div className="error-icon">⚠️</div>
      <h3>Erreur de chargement</h3>
      <p>{error}</p>
      <button className="btn-retry" onClick={() => window.location.reload()}>
        Réessayer
      </button>
    </div>
  );
  
  if (!lead) return (
    <div className="lead-not-found">
      <div className="not-found-icon">🔍</div>
      <h3>Aucune donnée trouvée</h3>
      <p>Le lead demandé n'existe pas ou a été supprimé.</p>
    </div>
  );

  const statusInfo = getStatusBadge(lead.statut);
  const dernierRappel = lead.dernier_rappel;
  const dernierRDV = lead.dernier_rdv;

  return (
    <div className="lead-info-container">
      {/* Header avec background gradient */}
      <div className="lead-header">
        <div className="header-content">
          <div className="lead-avatar">
            {lead.nom?.[0]?.toUpperCase()}{lead.prenom?.[0]?.toUpperCase()}
          </div>
          <div className="lead-title ">
            <h1>{lead.nom} {lead.prenom}</h1>
            <div className={`status-badge ${statusInfo.class}`}>
              <span className="status-icon">{statusInfo.icon}</span>
              {statusInfo.label}
            </div>
          </div>
        </div>
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Retour
        </button>
      </div>

      {/* Navigation par onglets */}
      <div className="lead-tabs">
        <button 
          className={`tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          📋 Informations
        </button>
        <button 
          className={`tab ${activeTab === 'quartiers' ? 'active' : ''}`}
          onClick={() => setActiveTab('quartiers')}
        >
          🗺️ Quartiers
        </button>
        <button 
          className={`tab ${activeTab === 'activite' ? 'active' : ''}`}
          onClick={() => setActiveTab('activite')}
        >
          📊 Activité
        </button>
        <button 
          className={`tab ${activeTab === 'biens' ? 'active' : ''}`}
          onClick={() => setActiveTab('biens')}
        >
          🏠 Biens associés
        </button>
      </div>

      {/* Contenu principal */}
      <div className="lead-content">
        {activeTab === 'info' && (
          <div className="info-grid">
            <div className="info-card">
              <div className="card-icon">📧</div>
              <div className="card-content">
                <h4>Email</h4>
                <p>{lead.email}</p>
                
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon">📞</div>
              <div className="card-content">
                <h4>Téléphone</h4>
                <p>{lead.telephone}</p>
                
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <h4>Budget</h4>
                <p className="budget-amount">{formatCurrency(lead.budget)}</p>
                <span className="budget-detail">Budget maximum</span>
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon">📐</div>
              <div className="card-content">
                <h4>Surface</h4>
                <p>{lead.surface} m²</p>
                <span className="surface-detail">Surface souhaitée</span>
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon">🏠</div>
              <div className="card-content">
                <h4>Type de bien</h4>
                <p>{lead.type_bien} {lead.etat_bien}</p>
                <span className="transaction-type">{lead.type_transaction}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon">🔥</div>
              <div className="card-content">
                <h4>Degré d'intérêt</h4>
                <p className={`interest-level ${lead.degre_interet?.toLowerCase()}`}>
                  {lead.degre_interet}
                </p>
              </div>
            </div>

            {lead.commercial && (
              <div className="info-card">
                <div className="card-icon">👤</div>
                <div className="card-content">
                  <h4>Commercial assigné</h4>
                  <p>{lead.commercial.nom} {lead.commercial.prenom}</p>
                  <span className="commercial-role">Commercial</span>
                </div>
              </div>
            )}

            <div className="info-card">
              <div className="card-icon">📅</div>
              <div className="card-content">
                <h4>Date de création</h4>
                <p>{new Date(lead.date_creation).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <span className="time-ago">
                  Il y a {Math.floor((new Date() - new Date(lead.date_creation)) / (1000 * 60 * 60 * 24))} jours
                </span>
              </div>
            </div>
          
            <div className="info-card">
              <div className="card-icon">👤</div>
              <div className="card-content">
                <h4>Source</h4>
                <p>{lead.source}</p>
                
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon">👤</div>
              <div className="card-content">
                <h4>Critères  </h4>
                <p>{
                    lead.ascenseur || lead.jardin || lead.terrasse || lead.garage
                    ? [
                        lead.ascenseur && "Ascenseur",
                        lead.jardin && "Jardin",
                        lead.terrasse && "Terrasse",
                        lead.garage && "Garage"
                        ].filter(Boolean).join(", ")
                    : "Aucune"
                }</p>
                
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quartiers' && (
          <div className="quartiers-section">
            <h3 className="section-title">Quartiers recherchés</h3>
            <div className="quartiers-grid">
              {lead.quartiers && lead.quartiers.map((quartier, index) => (
                <div key={index} className="quartier-card">
                  <div className="quartier-icon">📍</div>
                  <div className="quartier-info">
                    <h4>{quartier.quartier}</h4>
                    <p className="quartier-ville">{quartier.ville}</p>
                    <div className="quartier-details">
                      <span className="chambres-count">{quartier.nbr_chambre} chambre(s)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'activite' && (
          <div className="activity-section">
            <div className="activity-cards">
              {dernierRappel && (
                <div className="activity-card reminder">
                  <div className="activity-icon">⏰</div>
                  <div className="activity-content">
                    <h4>Dernier rappel</h4>
                    <p className="activity-date">
                      {new Date(dernierRappel.date_rappel).toLocaleString('fr-FR')}
                    </p>
                    <p className="activity-motif">{dernierRappel.motif}</p>
                  </div>
                </div>
              )}

              {dernierRDV && (
                <div className="activity-card rdv">
                  <div className="activity-icon">📅</div>
                  <div className="activity-content">
                    <h4>Dernier RDV</h4>
                    <p className="activity-date">
                      {new Date(dernierRDV.date_rdv).toLocaleString('fr-FR')}
                    </p>
                    <p className="activity-lieu">{dernierRDV.lieu}</p>
                  </div>
                </div>
              )}

              {lead.commentaires && lead.commentaires.length > 0 && (
                <div className="activity-card comments">
                  <div className="activity-icon">💬</div>
                  <div className="activity-content">
                    <h4>Commentaires ({lead.commentaires.length})</h4>
                    {lead.commentaires.map((comment, index) => (
                      <div key={index} className="comment-preview">
                        <p className="comment-text">{comment.contenue}</p>
                        <span className="comment-date">
                          {new Date(comment.date_creation).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!dernierRappel && !dernierRDV && (!lead.commentaires || lead.commentaires.length === 0) && (
                <div className="no-activity">
                  <div className="no-activity-icon">📊</div>
                  <h4>Aucune activité enregistrée</h4>
                  <p>Les actions et commentaires s'afficheront ici</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'biens' && (
          <div className="biens-section">
            <h3 className="section-title">Biens associés</h3>
            {lead.biens_associes && lead.biens_associes.length > 0 ? (
              <div className="biens-grid">
                {lead.biens_associes.map((bienAssocie, index) => (
                  <div key={index} className="bien-card">
                    <div className="bien-icon">🏠</div>
                    <div className="bien-info">
                      <h4>Référence: {bienAssocie.bien?.reference}</h4>
                      <p className="bien-price">{formatCurrency(bienAssocie.bien?.prix)}</p>
                      <p className="bien-location">{bienAssocie.bien?.ville}, {bienAssocie.bien?.quartier}</p>
                      <div className="bien-details">
                        <span>{bienAssocie.bien?.superficie} m²</span>
                        <span>•</span>
                        <span>{bienAssocie.bien?.nbr_chambre} ch.</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-biens">
                <div className="no-biens-icon">🔍</div>
                <h4>Aucun bien associé</h4>
                <p>Associez des biens à ce lead pour les afficher ici</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions footer */}
      {/* <div className="lead-actions">
        <button 
          className="btn-action secondary"
          onClick={() => navigate(-1)}
        >
          ← Retour à la liste
        </button>
      </div> */}
    </div>
  );
}

export default LeadInfo;
