import React, { useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import "../assets/styles/addLead.css";

import ville_data from '../../ville_quartier.json';

const AddLead = ({onCancel, onSuccess}) => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        telephone: '',
        email: '',
        type_bien: '',
        type_transaction: '',
        budget: '',
        surface: '',
        degre_interet: '',
        etat_bien: '',
        source: '',
        ascenseur: false,
        jardin: false,
        terrasse: false,
        garage: false,
        balcon: false,
        parking: false,
        meuble: false
    });

    const [quartiers, setQuartiers] = useState({
        quartier: [],
        ville: '',
        nbr_chambre: []
    });

    const [quartierOption, setQuartierOption] = useState([]);

    const navigate = useNavigate();

    const nbrChambreOptions = [
        { value: '1', label: 1 },
        { value: '2', label: 2 },
        { value: '3', label: 3 },
        { value: '4', label: 4 },
        { value: '5', label: 5 },
        { value: '6', label: 6 },
        
    ]; 

    const villeOptions = ville_data.map(r => ({label: r.ville, value: r.ville}));

    const regex = /^(?:\+212|0)\d{9}$/;

    const handleChange = (e) => {
        const { type, name, checked, value } = e.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            // const data_quartier = quartiers.quartier.map((q,i) => ({
            //     quartier: q, 
            //     ville: quartiers.ville, 
            //     nbr_chambre: quartiers.nbr_chambre[i] || quartiers.nbr_chambre[0] 
            // }));

            const data_quartier = quartiers.quartier.flatMap(q => 
                quartiers.nbr_chambre.map(chambre => ({
                    quartier: q,
                    ville: quartiers.ville,
                    nbr_chambre: chambre
                }))
            );


            const payload = {
                ...formData,
                quartiers: data_quartier
            };

            // console.log(JSON.stringify(payload,null,2)); 
            // const token = localStorage.getItem('access_token');
            const response = await axios.post(`${apiUrl}/lead/add_lead/`, payload, {
                headers: {
                    'Content-Type': "application/json",
                    Authorization: `Bearer ${token}` 
                },
                });
            
            alert("Lead ajouté avec succès !");
            navigate('../leads');
            onSuccess();
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'ajout du lead.");
        }
    };

    return (
        <div className="modal-overlay ">
      <div className="modal-content bg-white rounded-3">
        <div className="container mt-5 bg-white rounded-3"
            style={{ 
                fontFamily: "Inter, sans-serif",
                fontWeight: "bold",
                color: "rgb(33,37,41)",
                fontSize: "14px",
                lineHeight: "21px"
            }}
        >
            <h2>Ajouter un Lead</h2>
            <form onSubmit={handleSubmit}>
                <div className="div-input mb-3">
                    <div className="col1">
                        <label>Nom</label>
                        <input type="text" className="form-control" placeholder="Nom" name="nom" value={formData.nom} onChange={handleChange} required />
                    </div>
                    <div className="col2">
                        <label>Prenom</label>
                        <input type="text" className="form-control" placeholder="Prénom" name="prenom" value={formData.prenom} onChange={handleChange} />
                    </div>
                </div>
                <div className="div-input mb-3">
                    <div className="col1">
                        <label>Telephone</label>
                        <input type="text" className="form-control" placeholder="Téléphone" name="telephone" value={formData.telephone} onChange={handleChange} required />
                    </div>
                    <div className="col2">
                        <label>Email</label>
                        <input type="email" className="form-control" placeholder="Email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                </div>
                <div className="div-input mb-3">
                    <div className="col1">
                        <label>Type de bien</label>
                        <select className="form-control" name="type_bien" value={formData.type_bien} onChange={handleChange} required >
                            <option value="">-- Sélectionner le type de bien --</option>
                            <option value="Appartement">Appartement</option>
                            <option value="Bureau">Bureau</option>
                            <option value="Commerce">Commerce</option>
                            <option value="Ferme">Ferme</option>
                            <option value="Immeuble">Immeuble</option>
                            <option value="Maison">Maison</option>
                            <option value="Riad">Riad</option>
                            <option value="Terrain">Terrain</option>
                            <option value="Villa">Villa</option>
                        </select>
                    </div>
                    <div className="col2">
                        <label>Type de transaction</label>
                        <select className="form-control" name="type_transaction" value={formData.type_transaction} onChange={handleChange} required >
                            <option value="">-- Sélectionner le type de transaction --</option>
                            <option value="Achat">Achat</option>
                            <option value="Location">Location</option>
                            <option value="Sarout">Sarout</option>
                        </select>
                    </div>
                </div>
                <div className="div-input mb-3">
                    <div className="col1">
                        <label>Etat de bien</label>
                        <select className="form-control" name="etat_bien" value={formData.etat_bien} onChange={handleChange} required >
                            <option value="">-- Sélectionner le type de bien --</option>
                            <option value="Tous">Tous</option>
                            <option value="Neuf">Neuf</option>
                            <option value="2e main">2e main</option>
                            
                        </select>
                    </div>
                    <div className="col2">
                    <label>Source de lead</label>
                    <select className="form-control" name="source" value={formData.source} onChange={handleChange} required >
                        <option value="">Sélectionner la source de lead</option>
                        <option value="Avito">Avito</option>
                        <option value="Mubawab">Mubawab</option>
                        <option value="Appels spontanés">Appels spontanés</option>
                        <option value="Facebook">Facebook</option>
                    </select>
                </div>
                </div>
                    
               

                <div className="div-input mb-3">
                    <div className="col1">
                        <label>Budget</label>
                        <input type="number" className="form-control" placeholder="Budget" name="budget" value={formData.budget} onChange={handleChange} required />
                    </div>
                    <div className="col2">
                        <label>Surface</label>
                        <input type="number" className="form-control" placeholder="Surface" name="surface" value={formData.surface} onChange={handleChange} required />
                    </div>
                </div>

                <div className="div-input mb-3 mt-3">
                    <div className="col1">
                        <label>Ville</label>
                        <Select
                            
                            name="ville"
                            options={villeOptions}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Ville"
                            onChange={(selectedOption) => {
                                const selectedVille = selectedOption.value;
                                const quartierOption = ville_data.filter(elem => elem.ville === selectedVille)
                                    .flatMap(elem => elem.quartiers)
                                    .map(q => ({ value: q, label: q }));
                                setQuartierOption(quartierOption);
                                setQuartiers({...quartiers, ville: selectedVille});
                            }}
                            />
                    </div>

                    <div className="col2">
                        <label>Degre d'interet</label>
                        <select className="form-control" name="degre_interet" value={formData.degre_interet} onChange={handleChange} required >
                            <option value="">-- Sélectionner le degré d'intérêt --</option>
                            <option value="Haut">Haut</option>
                            <option value="Moyen">Moyen</option>
                            <option value="Faible">Faible</option>
                        </select>
                    </div>
                </div>

                {/* <h5>Choix principal</h5> */}
                <div className="div-input mb-3">
                    <div className="col1">
                        <label>Quartier (s)</label>
                        <Select
                            isMulti
                            name="quartier"
                            options={quartierOption}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Sélectionner le quartier"
                            onChange={(selectedOptions) => {
                                const selectedValues = selectedOptions.map(option => option.value);
                                setQuartiers({...quartiers, quartier: selectedValues});
                            }}
                            isOptionDisabled={() => quartiers.quartier.length >= 3}
                            />
                    </div>

                    <div className="col2">
                        <label>Nombre de chambre (s)</label>
                        <Select
                            isMulti
                            name="nbr_chambre"
                            options={nbrChambreOptions}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            placeholder="Sélectionner le nombre des chambres choisie"
                            onChange={(selectedOptions) => {
                                const selectedValues = selectedOptions.map(option => option.value);
                                setQuartiers({...quartiers, nbr_chambre: selectedValues});
                            }}
                            isOptionDisabled={() => quartiers.nbr_chambre.length >= 3}
                            />
                    </div>
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
                        <input type="checkbox" className="form-check-input" name="meuble" checked={formData.meuble} onChange={handleChange} />
                        <label className="form-check-label">Meublé</label>
                    </div>
                </div>
                
                <div className="mt-4">
                    <button type="submit" className="btn  me-3" style={{ backgroundColor: "#fa036b", color: "white" }}>Ajouter le lead</button>
                    <button className="btn btn-light" style={{ backgroundColor: "#eee", color: "#333" }} onClick={onCancel}>
                        Fermer
                    </button>
                </div>
            </form>
        </div>
        </div></div>
    );
};

export default AddLead;
