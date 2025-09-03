import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NavBar from '../Partie/navbar'
import Select from 'react-select';
import ville_data from '../../ville_quartier.json';

const villeOptions = ville_data.map(r => ({label: r.ville, value: r.ville}));

const AddBien = ({onCancel, onSuccess}) => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const regex = /^(?:\+212|0)\d{9}$/;
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type_bien: '',
        type_transaction: '',
        prix: '',
        superficie: '',
        nbr_chambre: '',
        nbr_sdb: '',
        etage: '',
        ville: '',
        quartier: '',
        adresse: '',
        prop_nom: '',
        prop_prenom: '',
        prop_telephone: '',
        statut_commercial: 'Disponible',
        degre_importance: '',
        etat_bien: '',
        ascenseur: false,
        jardin: false,
        terrasse: false,
        garage: false,
        balcon: false,
        parking: false,
        piscine: false,
        meuble: false,
        is_validated: false
    });

    const [quartierOption, setQuartierOption] = useState([]);

    const generateReference = () => {
        const randomNum = Math.floor(10000 + Math.random() * 90000); // Génère un nombre entre 100 et 999
        return `${randomNum}`;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Payload envoyé:", formData);
        const reference = generateReference()
        const dataToSend = {
            ...formData,
            reference: reference
        }
        try {
            const token = localStorage.getItem("access_token");
            const response = await axios.post(`${apiUrl}/bien/api/biens/`, dataToSend, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                withCredentials: false,  // Mettez à true si vous utilisez les sessions/cookies
                   });
                console.log("Réponse du serveur:", response.data);
                onSuccess();
                alert('Bien ajouté avec succès!');
                navigate('/biens')
            } catch (error) {
                console.error("Erreur complète:", {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
                if (error.response?.status === 400) {
                    const serverError = error.response?.data;
                    if (serverError?.reference) {
                        alert(`Erreur: La référence ${formData.reference} existe déjà.`);
                    } else {
                        alert(`Erreur: ${JSON.stringify(serverError)}`);
                    }
                } else {
                    alert(`Erreur: ${error.response?.data?.detail || error.message}`);
                }
            }
        };

    return (
        <>
        <div className="modal-overlay ">
      <div className="modal-content bg-white rounded-3">
        <div className="container mt-5">
            <h2>Ajouter un nouveau bien</h2>
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">Type de bien</label>
                            <select className="form-control" name="type_bien" value={formData.type_bien} onChange={handleChange} required >
                                <option value="">-- Sélectionner le type du bien --</option>
                                <option value="Appartement">Appartement</option>
                                <option value="Bureau">Bureau</option>
                                <option value="Commerce">Commerce</option>
                                <option value="Ferme">Ferme</option>
                                <option value="Immeuble">Immeuble</option>
                                <option value="Maison">Maison</option>
                                <option value="Riad">Riad</option>
                                <option value="Terrain">Terrain</option>
                                <option value="Villa">Villa</option>
                                <option value="Local">Local</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Type de transaction</label>
                            <select className="form-select" name="type_transaction" value={formData.type_transaction} onChange={handleChange} required>
                                <option value="">Sélectionnez...</option>
                                <option value="Vente">Vente</option>
                                <option value="Location">Location</option>
                                <option value="Sarout">Sarout</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Prix</label>
                            <input type="number" className="form-control" name="prix" value={formData.prix} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Superficie (m²)</label>
                            <input type="number" className="form-control" name="superficie" value={formData.superficie} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Nombre de chambres</label>
                            <input type="number" className="form-control" name="nbr_chambre" value={formData.nbr_chambre} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Nom du propriétaire</label>
                            <input type="text" className="form-control" name="prop_nom" value={formData.prop_nom} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">Étage</label>
                            <input type="number" className="form-control" name="etage" value={formData.etage} onChange={handleChange} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Ville</label>
                            <Select name="ville" options={villeOptions} onChange={(selectedOption)=>{
                                const ville = selectedOption.value;
                                const quartier = ville_data.filter(elem => elem.ville === ville )
                                .flatMap(q => q.quartiers)
                                .map(v => ({ label: v, value: v}));
                                setQuartierOption(quartier)
                                setFormData({...formData,ville : ville})
                            }} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Quartier</label>
                            <Select name="quartier" options={quartierOption} onChange={(selectedOption)=>{
                                const quartier = selectedOption.value;
                                setFormData({...formData,quartier})
                            }}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Adresse</label>
                            <input type="text" className="form-control" name="adresse" value={formData.adresse} onChange={handleChange} required />
                        </div>
                        {/* <div className="mb-3">
                            <label className="form-label">Nom du propriétaire</label>
                            <input type="text" className="form-control" name="prop_nom" value={formData.prop_nom} onChange={handleChange} required />
                        </div> */}
                        <div className="mb-3">
                            <label className="form-label">Prénom du propriétaire</label>
                            <input type="text" className="form-control" name="prop_prenom" value={formData.prop_prenom} onChange={handleChange} required />
                        </div>
                        <div className="row mb-3">
                        <div className="col">
                            <label>Telephone</label>
                            <input type="text" className="form-control" placeholder="Téléphone" name="prop_telephone" value={formData.prop_telephone} onChange={handleChange} required />
                        </div>
                    </div>
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">Degré d'importance</label>
                    <select className="form-select" name="degre_importance" value={formData.degre_importance} onChange={handleChange} required>
                        <option value="">Sélectionnez...</option>
                        <option value="Faible">Faible</option>
                        <option value="Moyen">Moyen</option>
                        <option value="Élevé">Élevé</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label className="form-label">Etat du bien</label>
                    <select className="form-select" name="etat_bien" value={formData.etat_bien} onChange={handleChange} required>
                        <option value="">Selectionner</option>
                        <option value="Neuf">Neuf</option>
                        <option value="2e main">2e main</option>
                    </select>
                </div>
                <div className="div-input">
                    <div className="col1 mb-3 form-check">
                        <input type="checkbox" className="form-check-input" name="ascenseur" checked={formData.ascenseur} onChange={handleChange} />
                        <label className="form-check-label">Ascenseur</label>
                    </div>
                    <div className="col2 mb-3 form-check">
                        <input type="checkbox" className="form-check-input" name="jardin" checked={formData.jardin} onChange={handleChange} />
                        <label className="form-check-label">Jardin</label>
                    </div>
                </div>
                <div className="div-input">
                    <div className="col1 mb-3 form-check">
                        <input type="checkbox" className="form-check-input" name="terrasse" checked={formData.terrasse} onChange={handleChange} />
                        <label className="form-check-label">Terrasse</label>
                    </div>
                    <div className="col2 mb-3 form-check">
                        <input type="checkbox" className="form-check-input" name="garage" checked={formData.garage} onChange={handleChange} />
                        <label className="form-check-label">Garage</label>
                    </div>
                </div>
                <div className="div-input">
                    <div className="col1 mb-3 form-check">
                        <input type="checkbox" className="form-check-input" name="balcon" checked={formData.balcon} onChange={handleChange} />
                        <label className="form-check-label">Balcon</label>
                    </div>
                    <div className="col2 mb-3 form-check">
                        <input type="checkbox" className="form-check-input" name="parking" checked={formData.parking} onChange={handleChange} />
                        <label className="form-check-label">Parking</label>
                    </div>
                </div>
                <div className="div-input">
                    <div className="col1 mb-3 form-check">
                        <input type="checkbox" className="form-check-input" name="piscine" checked={formData.piscine} onChange={handleChange} />
                        <label className="form-check-label">Piscine</label>
                    </div>
                    <div className="col1 mb-3 form-check">
                        <input type="checkbox" className="form-check-input" name="meuble" checked={formData.meuble} onChange={handleChange} />
                        <label className="form-check-label">Meublé</label>
                    </div>
                </div>
                <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" name="is_validated" checked={formData.is_validated} onChange={handleChange} />
                    <label className="form-check-label">Validé</label>
                </div>
                <button type="submit" className="btn me-3" style={{ backgroundColor: "#fa036b", color: "white" }}>Ajouter le bien</button>
                <button onClick={onCancel} className="btn " style={{ backgroundColor: "#eee", color: "#333" }}>Annuler</button>
            </form>
            
        </div>
        </div>
        </div>
        </>
    );
};

export default AddBien;