import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Modal, Button } from 'react-bootstrap';
import ville_data from "../../ville_quartier.json";

const nbrChambreOptions = [
    { value: '1', label: 1 },
    { value: '2', label: 2 },
    { value: '3', label: 3 },
    { value: '4', label: 4 },
    { value: '5', label: 5 },
    { value: '6', label: 6 },
];

const villeOptions = ville_data.map(r => ({label: r.ville, value: r.ville}));

const UpdateLead = ({ lead, setSelectedLead, show, handleClose, onSuccess }) => {
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
        ascenseur: false,
        jardin: false,
        terrasse: false,
        garage: false,
        balcon: false,
        parking: false,
        piscine: false,
        meuble: false
    });

    const [quartiers, setQuartiers] = useState({
        ville: '',
        quartier: [],
        nbr_chambre: [],
    });

    const [quartierOption, setQuartierOption] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (lead) {
            // axios.get(`http://127.0.0.1:8000/lead/lead/${leadId}/`, {
            //     headers: {
            //         'Content-Type': "application/json",
            //         Authorization: `Bearer ${token}`
            //     },
            // })
            // .then((res) => {
            //    const lead = res.data;
            setFormData({
                nom: lead.nom || '',
                prenom: lead.prenom || '',
                telephone: lead.telephone || '',
                email: lead.email || '',
                type_bien: lead.type_bien || '',
                type_transaction: lead.type_transaction || '',
                budget: lead.budget || '',
                surface: lead.surface || '',
                degre_interet: lead.degre_interet || '',
                etat_bien: lead.etat_bien || '',   // <-- ajouté
                ascenseur: lead.ascenseur || false, // <-- ajouté
                jardin: lead.jardin || false,       // <-- ajouté
                terrasse: lead.terrasse || false,   // <-- ajouté
                garage: lead.garage || false,
                balcon: lead.balcon || false,
                parking: lead.parking || false,
                piscine: lead.piscine || false,
                meuble: lead.meuble || false,
            });
            const ville = lead.quartiers?.[0]?.ville || '';
            const quartierArr = lead.quartiers?.map(q => q.quartier) || [];
            const chambreArr = lead.quartiers?.map(q => String(q.nbr_chambre)) || [];
            setQuartiers({
                ville: ville,
                quartier: quartierArr,
                nbr_chambre: chambreArr,
            });
            const quartierOption = ville_data
                .filter(elem => elem.ville === ville)
                .flatMap(elem => elem.quartiers)
                .map(q => ({ value: q, label: q }));
            setQuartierOption(quartierOption);
            // })
            // .catch((err) => {
            //     console.error(err.response?.data || err.message);
            // });
        }
    }, [lead]);

    useEffect(() => {
        if (quartiers.ville) {
            const quartierOption = ville_data
                .filter(elem => elem.ville === quartiers.ville)
                .flatMap(elem => elem.quartiers)
                .map(q => ({ value: q, label: q }));
            setQuartierOption(quartierOption);
        }
    }, [quartiers.ville]);

    // const handleChange = (e) => {
    //     setFormData({ ...formData, [e.target.name]: e.target.value });
    // };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');

        const data_quartier = quartiers.quartier.flatMap(q => 
            quartiers.nbr_chambre.map(chambre => ({
                quartier: q,
                ville: quartiers.ville,
                nbr_chambre: chambre
            }))
        );

        const dataFinal = {
            ...formData,
            quartiers: data_quartier,
        };

        axios.put(`${apiUrl}/lead/update_lead/${lead.id}/`, dataFinal, {
            headers: {
                'Content-Type': "application/json",
                Authorization: `Bearer ${token}`
            },
        })
        .then(() => {
            alert("Lead modifié avec succès");
            onSuccess();
            setSelectedLead(null);
            handleClose();
        })
        .catch((err) => {
            console.error(err.response?.data || err.message);
        });
    };

    return (
        <>
        <div className="modal-overlay ">
      <div className="modal-content bg-white rounded-3">
                {/* <form onSubmit={handleSubmit}> */}
                    {/* tes champs ici... (identiques à ta version précédente) */}
                {/* </form> */}
                <div className="container mt-5">
            <h2>Modifier un Lead</h2>
            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col">
                        <input type="text" className="form-control" placeholder="Nom" name="nom" value={formData.nom} onChange={handleChange} required />
                    </div>
                    <div className="col">
                        <input type="text" className="form-control" placeholder="Prénom" name="prenom" value={formData.prenom} onChange={handleChange} />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col">
                        <input type="text" className="form-control" placeholder="Téléphone" name="telephone" value={formData.telephone} onChange={handleChange} required />
                    </div>
                    <div className="col">
                        <input type="email" className="form-control" placeholder="Email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col">
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
                    <div className="col">
                        <input type="text" className="form-control" placeholder="Type de transaction" name="type_transaction" value={formData.type_transaction} onChange={handleChange} required />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col">
                        <input type="number" className="form-control" placeholder="Budget" name="budget" value={formData.budget} onChange={handleChange} required />
                    </div>
                    <div className="col">
                        <input type="number" className="form-control" placeholder="Surface" name="surface" value={formData.surface} onChange={handleChange} required />
                    </div>
                </div>

                <div className="row mb-3 mt-3">
                    <div className="col">
                        <label>Ville</label>
                        <Select
                            name="ville"
                            options={villeOptions}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            value={villeOptions.find(opt => opt.value === quartiers.ville) || null}
                            onChange={(selectedOption) => {
                                setQuartiers({
                                    ...quartiers,
                                    ville: selectedOption.value,
                                    quartier: [],
                                    nbr_chambre: [],
                                });
                            }}
                            required
                        />
                    </div>
                    <div className="col">
                        <select className="form-control" name="degre_interet" value={formData.degre_interet} onChange={handleChange} required >
                            <option value="">-- Sélectionner le degré d'intérêt --</option>
                            <option value="Haut">Haut</option>
                            <option value="Moyen">Moyen</option>
                            <option value="Faible">Faible</option>
                        </select>
                    </div>
                </div>

                {/* Choix principal */}
                <h5>Choix principal</h5>
                <div className="row mb-3">
                    <div className="col">
                        <label>Quartiers</label>
                        <Select
                            isMulti
                            name="quartier"
                            options={quartierOption}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            value={quartierOption.filter(opt => quartiers.quartier.includes(opt.value))}
                            onChange={(selectedOptions) => {
                                const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                setQuartiers({ ...quartiers, quartier: selectedValues });
                            }}
                            isOptionDisabled={() => quartiers.quartier.length >= 6}
                            required
                        />
                    </div>
                    <div className="col">
                        <label>Nombre de chambres</label>
                        <Select
                            isMulti
                            name="nbr_chambre"
                            options={nbrChambreOptions}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            value={nbrChambreOptions.filter(opt => quartiers.nbr_chambre.includes(String(opt.value)))} // <-- CORRECT
                            onChange={(selectedOptions) => {
                                const selectedValues = selectedOptions ? selectedOptions.map(option => String(option.value)) : [];
                                setQuartiers({ ...quartiers, nbr_chambre: selectedValues });
                            }}
                            isOptionDisabled={() => quartiers.nbr_chambre.length >= 3}
                            required
                        />
                    </div>
                </div>

                <div className="col">
                        <label>Etat de bien</label>
                        <select className="form-control" name="etat_bien" value={formData.etat_bien} onChange={handleChange} required >
                            <option value="">-- Sélectionner le type de bien --</option>
                            <option value="Tous">Tous</option>
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
                        <input type="checkbox" className="form-check-input" name="meuble" checked={formData.meuble} onChange={handleChange} />
                        <label className="form-check-label">Meublé</label>
                    </div>
                    <div className="col2 mb-3 form-check">
                        <input type="checkbox" className="form-check-input" name="piscine" checked={formData.piscine} onChange={handleChange} />
                        <label className="form-check-label">Piscine</label>
                    </div>
                </div>
                <div className="mt-4">
                    <button type="submit" className="btn " style={{ backgroundColor: "#fa036b", color: "white" }}>Modifier</button>
                    <button type="button" className="btn ms-2" style={{ backgroundColor: "#eee", color: "#333" }} onClick={handleClose}>Annuler</button>
                </div>
            </form>
        </div>
        </div></div>
           </>
    );
};

export default UpdateLead;
