import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../Partie/navbar';

const BiensProposes = ({leadSelected, onCancel, onSuccess}) => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [biens, setBiens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBiens, setSelectedBiens] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();
    
    // Récupération du lead passé en navigation
    const lead = leadSelected;

    const handleSelectBien = (bienId) => {
    setSelectedBiens(prev => 
        prev.includes(bienId) 
            ? prev.filter(id => id !== bienId) 
            : [...prev, bienId]
        );
    };

    const fetchAssociatedBiens = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`${apiUrl}/associated-biens/${lead.id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const associatedBienArray = Array.isArray(response.data) ? response.data : [];
            // Extraction des IDs seulement
            const associatedBienIds = associatedBienArray.map(bien => bien.id);
            setSelectedBiens(associatedBienIds);
            return associatedBienArray;
        } catch (error) {
            console.error("Error fetching associated biens:", error);
            return [];
        }
    };

    const handleAssocierBiens = async () => {
        try {
            const token = localStorage.getItem('access_token');// Récupérer les biens actuellement associés
            const existingResponse = await axios.get(`${apiUrl}/lead/associated-biens/${lead.id}/`,{
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const existingBiens = existingResponse.data.map(bien => bien.id || bien);// Biens à ajouter (sélectionnés mais pas encore associés)
            const biensToAdd = selectedBiens.filter(id => !existingBiens.includes(id));
        // Biens à supprimer (déjà associés mais décochés)
            const biensToRemove = existingBiens.filter(id => !selectedBiens.includes(id));

        // Traitement des ajouts
            if (biensToAdd.length > 0) {
                await axios.post(`${apiUrl}/lead/associer-bien/${lead.id}/`,{ 
                    biens_ids: biensToAdd 
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            onSuccess();
        }
        if (biensToRemove.length > 0) {
            await axios.post(`${apiUrl}/lead/supprimer-association-bien/${lead.id}/`,
                { 
                    biens_ids: biensToRemove 
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            onSuccess();
        }

        if (biensToAdd.length > 0 || biensToRemove.length > 0) {
            alert('Modifications des associations enregistrées avec succès!');
            // Rafraîchir entièrement la liste pour inclure uniquement les biens associés (même hors filtres)
            await fetchBiens();
            onSuccess();
        } else {
            alert('Aucune modification détectée dans les associations.');
        }
        } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            response: error.response?.data,
            config: error.config
        });
        
        let errorMessage = 'Failed to update property associations';
        if (error.response) {
            errorMessage += `: ${error.response.data.error || error.response.statusText}`;
        }
        alert(errorMessage);
        }
    };

    const handleRemoveAllAssociations = async () => {
    try {
        const token = localStorage.getItem('access_token');
        const existingResponse = await axios.get(
            `${apiUrl}/lead/associated-biens/${lead.id}/`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        
        const existingBiens = existingResponse.data.map(bien => bien.id || bien);
        
        if (existingBiens.length > 0) {
            await axios.post(
                `${apiUrl}/lead/supprimer-association-bien/${lead.id}/`,
                { 
                    biens_ids: existingBiens 
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            alert('Toutes les associations ont été supprimées avec succès!');
            setSelectedBiens([]);
            await fetchBiens();
            onSuccess();
        } else {
            alert('Aucune association existante à supprimer.');
        }
    } catch (error) {
        console.error('Error removing all associations:', error);
        alert('Erreur lors de la suppression des associations');
    }
    };

    const fetchBiens = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('access_token');
            if (!token) return navigate('/login');
            const params = new URLSearchParams();
            params.append('is_validated', 'true');
            params.append('ville',lead.quartiers[0].ville);
            params.append('budget_lead' , lead.budget);
            params.append('type_bien',lead.type_bien);
            params.append('type_transaction', lead.type_transaction === "Achat" ? "Vente":lead.type_transaction);
            params.append('statut_commercial','Disponible');
            params.append('surface', lead.surface);
            params.append('etat_bien',lead.etat_bien);
            [...new Set(lead.quartiers.map(q => q.quartier))].forEach(quartier => {
            params.append('quartiers', quartier);
            });
            [...new Set(lead.quartiers.map(q => q.nbr_chambre.toString()))].forEach(chambre => {
            params.append('chambres', chambre);
            });
            const response = await axios.get(`${apiUrl}/bien/api/biens/`, {
                params,
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const availableBiens = Array.isArray(response.data) ? response.data : [];
            // Récupérer les biens déjà associés, même s'ils ne sont pas dans la liste filtrée
            const associatedList = await fetchAssociatedBiens();

            // Fusionner sans doublons
            const seen = new Set();
            const merged = [];
            for (const b of [...availableBiens, ...associatedList]) {
                if (b && !seen.has(b.id)) {
                    seen.add(b.id);
                    merged.push(b);
                }
            }

            setBiens(merged);
        } catch (err) {
            setError(err.response?.data?.detail || err.message);
            if (err.response?.status === 401) navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBiens();
    }, [lead, navigate]);

    // Affichage des états
    if (!lead) {
        return (
            <>
                <Navbar />
                <div className="container mt-5">
                    <div className="alert alert-danger">
                        Aucun lead sélectionné. 
                        <button 
                            onClick={() => navigate('/leads')} 
                            className="btn btn-link"
                        >
                            Retour à la liste
                        </button>
                    </div>
                </div>
            </>
        );
    }

    if (loading) {
        return (
            <>
                <div className="text-center mt-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p>Recherche des biens correspondants...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="container mt-5">
                    <div className="alert alert-danger">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                        <div className="mt-2">
                            <button 
                                onClick={() => navigate('/leads')} 
                                className="btn btn-outline-danger"
                            >
                                Retour à la liste
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Affichage principal
    return (
        <>
            <div className="modal-overlay ">
      <div className="modal-content bg-white rounded-3">
            <div className=" ">
                <div className="card  mb-4">
                    <div className="card-header bg-primary text-white">
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">
                                <i className="bi bi-house-gear me-2"></i>
                                Biens proposés pour {lead.nom} {lead.prenom}
                            </h4>
                            <button 
                                onClick={onCancel} 
                                className="btn btn-light btn-sm"
                            >
                                <i className="bi bi-arrow-left"></i> Annuler
                            </button>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="mb-3 p-3 bg-light rounded">
                            <h5>Critères de recherche :</h5>
                            <ul className="mb-0">
                                <li>Budget : {lead.budget} dhs (±15%)</li>
                                <li>Ville : {lead.quartiers[0].ville || "Non spécifiée"}</li>
                                <li>Quartiers : {[...new Set(lead.quartiers.map(q => q.quartier))].join(', ')}</li>
                                <li>Nombre de chambres : {[...new Set(lead.quartiers.map(q => q.nbr_chambre))].join(', ')}</li>
                                <li>Surface : {lead.surface} m² (±15%)</li>
                                <li>Type de bien : {lead.type_bien}</li>
                                <li>Transaction : {lead.type_transaction}</li>
                                <li>Etat du Bien : {lead.etat_bien}</li>
                                <li>
                                    Critères: {
                                        lead.ascenseur || lead.jardin || lead.terrasse || lead.garage || lead.balcon || lead.parking || lead.meuble
                                        ? [
                                            lead.ascenseur && "Ascenseur",
                                            lead.jardin && "Jardin",
                                            lead.terrasse && "Terrasse",
                                            lead.garage && "Garage"
                                            ].filter(Boolean).join(", ")
                                        : "Aucune"
                                    }
                                </li>
                            </ul>
                        </div>

                        {biens.length > 0 && (
                            <div className="d-flex justify-content-end mb-3 gap-2">
                                <button className="btn btn-danger" onClick={handleRemoveAllAssociations} disabled={selectedBiens.length === 0}>
                                    Tout désassocier
                                </button>
                                <button className="btn btn-success" onClick={handleAssocierBiens}>
                                    {selectedBiens.length === 0 ? 'Supprimer toutes les associations' : 'Mettre à jour les associations'}
                                </button>
                            </div>
                        )}

                        {biens.length === 0 ? (
                            <div className="alert alert-info mt-3">
                                <i className="bi bi-info-circle-fill me-2"></i>
                                Aucun bien disponible correspondant à ces critères
                            </div>
                        ) : (
                            <div className="table-responsive mt-3">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Sélection</th>
                                            <th>Référence</th>
                                            <th>Type</th>
                                            <th>Etat</th>
                                            <th>Prix (dhs)</th>
                                            <th>Surface (m²)</th>
                                            <th>Chambres</th>
                                            <th>Quartier</th>
                                            <th>Adresse</th>
                                            <th>Type</th>
                                            <th>Criteres</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {biens.map(bien => (
                                            <tr key={bien.id} className="cursor-pointer">
                                                <td><input type="checkbox" checked={selectedBiens.includes(bien.id)} onChange={() => handleSelectBien(bien.id)} /></td>
                                                <td className="fw-bold">{bien.reference}</td>
                                                <td>{bien.type_bien}</td>
                                                <td>{bien.etat_bien}</td>
                                                <td>{bien.prix?.toLocaleString?.() ?? bien.prix}</td>
                                                <td>{bien.superficie}</td>
                                                <td>{bien.nbr_chambre}</td>
                                                <td>{bien.quartier}</td>
                                                <td>
                                                    <a 
                                                        href={`https://www.google.com/maps/search/?api=1&query=${bien.adresse}, ${bien.quartier}, ${bien.ville}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-decoration-none"
                                                        onClick={e => e.stopPropagation()}
                                                    >
                                                        <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                                                        {bien.adresse}
                                                    </a>
                                                </td>
                                                <td>{bien.type_transaction}</td>
                                                <td>{bien.ascenseur ? "Ascenseur" : ""} {bien.jardin ? "Jardin" : ""} {bien.terrasse ? "Terrasse" : ""} {bien.garage ? "Garage" : ""}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>
            </div>
        </>
    );
};

export default BiensProposes;