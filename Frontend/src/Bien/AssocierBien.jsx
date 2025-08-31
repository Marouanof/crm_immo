import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const AssocierBien = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [biens, setBiens] = useState([]);
    const [selectedBien, setSelectedBien] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem("access_token");
    const { lead } = location.state || {};

    useEffect(() => {
        const fetchBiens = async () => {
            try {
                const response = await axios.get(`${apiUrl}/bien/api/biens/`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    }
                });
                setBiens(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message || 'Erreur lors de la récupération des biens');
                setLoading(false);
            }
        };
        fetchBiens();
    }, [token]);

    const handleAssociate = async () => {
        if (!selectedBien) {
            alert('Veuillez sélectionner un bien');
            return;
        }

        try {
            await axios.post(`${apiUrl}/lead/associate-bien/${lead.id}/`, {
                bien_id: selectedBien
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                }
            });
            alert('Bien associé avec succès!');
            navigate(-1); // Retour à la page précédente
        } catch (error) {
            console.error("Erreur lors de l'association:", error);
            alert('Erreur lors de l\'association du bien');
        }
    };

    if (loading) return <div className="text-center mt-5">Chargement...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!lead) return <div className="alert alert-danger">Lead non trouvé</div>;

    return (
        <div className="container mt-5 bg-white rounded-3">
            <h2>Associer un bien au lead {lead.nom} {lead.prenom}</h2>
            
            <div className="mb-3">
                <label className="form-label">Sélectionnez un bien:</label>
                <select 
                    className="form-select"
                    value={selectedBien}
                    onChange={(e) => setSelectedBien(e.target.value)}
                >
                    <option value="">-- Sélectionnez un bien --</option>
                    {biens.map(bien => (
                        <option key={bien.id} value={bien.id}>
                            {bien.reference} - {bien.type_bien} ({bien.type_transaction}) - {bien.prix} dhs
                        </option>
                    ))}
                </select>
            </div>

            <div className="d-flex gap-2">
                <button 
                    className="btn"
                    style={{ backgroundColor: "#fa036b", color: "white" }}
                    onClick={handleAssociate}
                    disabled={!selectedBien}
                >
                    Associer
                </button>
                <button 
                    className="btn"
                    style={{ backgroundColor: "#eee", color: "#333" }}
                    onClick={() => navigate(-1)}
                >
                    Annuler
                </button>
            </div>
        </div>
    );
};

export default AssocierBien;