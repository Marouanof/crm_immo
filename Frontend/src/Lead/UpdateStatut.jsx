import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

const UpdateStatut = ({ lead, onClose, onSuccess, onChange, onRefresh }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [selectedStatus, setSelectedStatus] = useState(lead.statut);
  const [motif, setMotif] = useState('');
  const [dateRappel, setDateRappel] = useState('');
  const [dateRDV, setDateRDV] = useState('');
  const [lieu, setLieu] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [associatedBien,setAssociatedBiens]= useState([]);
  const [hasAssociatedBien, setHasAssociatedBien] = useState(false);
  const [commentaire, setCommentaire] = useState('');

  const motifs = [
    { value: 'recherche_de_bien', label: 'Recherche de bien' },
    { value: 'rdv_annule', label: 'RDV annulé' },
    { value: 'rdv_non_honore', label: 'RDV non honoré' },
    { value: 'rappel_demande', label: 'Rappel demandé' },
    { value: 'reflexion', label: 'En réflexion' },
    { value: 'negociation', label: 'En négociation' },
    { value: 'telephone_eteint', label: 'Téléphone éteint' },
  ];
  const motifsPerdu = [
    { value: 'confrere', label: 'Confrère' },
    { value: 'injoignable', label: 'Injoignable' },
  ];

  const formatDateForAPI = (dateString) => {
    return new Date(dateString).toISOString();
  };

  useEffect(() => {
    const fetchAssociatedBiens = async () => {
      try {
        const response = await axios.get(`${apiUrl}/lead/associated-biens/${lead.id}/`);
        setAssociatedBiens(response.data);
        setHasAssociatedBien(response.data.length > 0);
      } catch (error) {
        console.error("Erreur lors de la récupération des biens associés:", error);
      }
    };
    if (lead?.id) {
      fetchAssociatedBiens();
    }
  }, [lead]);

  const handleSubmit = async () => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
       if (!selectedStatus || selectedStatus === "") {
        setError("Veuillez sélectionner un statut valide");
        return;
      }
      if (!commentaire) {
        throw new Error("Veuillez ajouter un commentaire");
      }

      // Validation des données
      if (selectedStatus === 'A rappeler') {
        if (!motif || !dateRappel) {
          throw new Error("Veuillez remplir tous les champs pour un rappel");
        }
        if (new Date(dateRappel) < new Date()) {
          throw new Error("La date de rappel ne peut pas être dans le passé");
        }
      }

      // if (selectedStatus === 'RDV planifié') {
      //   if (!dateRDV || !lieu) {
      //     throw new Error("Veuillez remplir tous les champs pour un rdv");
      //   }
      //   if (!hasAssociatedBien) {
      //     throw new Error("Vous devez d'abord associer un bien au lead avant de planifier un RDV");
      //   }
      // }

      if (selectedStatus === 'RDV planifié') {
        if (!dateRDV || !lieu) {
          throw new Error("Veuillez remplir tous les champs pour un rdv");
        }
        if (!hasAssociatedBien) {
          throw new Error("Vous devez d'abord associer un bien au lead avant de planifier un RDV");
        }
        if (new Date(dateRDV) < new Date()) {
          throw new Error("La date de rappel ne peut pas être dans le passé");
        }
      }
      if (selectedStatus === 'Perdu' && !motif) {
        throw new Error("Veuillez sélectionner un motif de perte");
      }
      // Envoi des données selon le statut
      if (selectedStatus === 'A rappeler') {
        await axios.post(`${apiUrl}/lead/rappels/`, {
          id_lead: lead.id,
          date_rappel: formatDateForAPI(dateRappel),
          motif: motif
        });
      } 
      if (selectedStatus === 'RDV planifié') {
        await axios.post(`${apiUrl}/lead/rdvs/`, {
          id_lead: lead.id,
          date_rdv: formatDateForAPI(dateRDV),
          lieu : lieu
        });
      } 

      // Mise à jour du statut du lead
      //await axios.patch(`http://localhost:8000/lead/update_lead_statut/${lead.id}/`, {
      //  statut: selectedStatus
      //});
      await axios.patch(`${apiUrl}/lead/update_lead_status_with_comment/${lead.id}/`, {
        statut: selectedStatus,
        commentaire: commentaire,
        motif_perte: motif
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );


      onSuccess();
      // onRefresh();
      onClose();
    } catch (error) {
      console.error("Erreur détaillée:", {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      setError(error.response?.data?.detail || error.message);
    } finally {
      setIsUpdating(false);
    }
  };
  const getCurrentDateTime = () => {
    const now = new Date();
    // Convertir en format compatible avec datetime-local (YYYY-MM-DDTHH:MM)
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

  return (
    <div className="modal-overlay ">
      <div className="modal-content bg-white rounded-3">
        <h4>Modifier le statut:</h4>
        
        {error && (
          <div className="alert alert-danger mb-3">
            {error}
          </div>
        )}

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="form-select mb-3"
          disabled={isUpdating}
        >
          <option value="">--Changer Statut--</option>
          <option value="A rappeler">A rappeler</option>
          <option value="RDV planifié">RDV planifié</option>
          <option value="Perdu">Perdu</option>
        </select>

        {selectedStatus === 'A rappeler' && (
          <>
            <div className="mb-3">
              <label>Motif du rappel:</label>
              <select
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                className="form-select"
                required
                disabled={isUpdating}
              >
                <option value="">Sélectionnez un motif</option>
                {motifs.map((m, i) => (
                  <option key={i} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label>Date du rappel:</label>
              <input
                type="datetime-local"
                className="form-control"
                value={dateRappel}
                onChange={(e) => setDateRappel(e.target.value)}
                required
                disabled={isUpdating}
              />
            </div>
          </>
        )}

        {selectedStatus === 'RDV planifié' && (
          <>
           <div className="mb-3">
            <label>Lieu du rdv:</label>
              <input
              type="text"
                value={lieu}
                onChange={(e) => setLieu(e.target.value)}
                className="form-control"
                required
                disabled={isUpdating}
              />
            </div>
            <div className="mb-3">
              <label>Date du rdv:</label>
              <input
                type="datetime-local"
                className="form-control"
                value={dateRDV}
                onChange={(e) => setDateRDV(e.target.value)}
                required
                disabled={isUpdating}
              />
           </div>
          </>
        )}
        {selectedStatus === 'Perdu' && (
          <div className="mb-3">
            <label>Motif de perte:</label>
            <select
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="form-select"
              required
              disabled={isUpdating}
            >
              <option value="">Sélectionnez un motif</option>
              {motifsPerdu.map((m, i) => (
                <option key={i} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-3">
          <label>Commentaire (obligatoire):</label>
          <textarea className="form-control" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} required disabled={isUpdating}/>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button
            className="btn me-3"
            style={{ backgroundColor: "#eee", color: "#333" }}
            onClick={onClose}
            disabled={isUpdating}
          >
            Annuler
          </button>
          <button
            className="btn "
            style={{ backgroundColor: "#fa036b" , color: "white" }}
            onClick={()=>{
              handleSubmit();
              onChange();
            }}
            disabled={
              isUpdating || 
              (selectedStatus === 'A rappeler' && (!motif || !dateRappel)) || (selectedStatus === 'RDV planifié' && (!dateRDV || !lieu))
            }
          >
            {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatut;