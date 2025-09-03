import React,{useState,useEffect} from 'react'
import axios from 'axios'
import { useNavigate,useParams } from 'react-router-dom'
import NavBar from '../Partie/navbar'
import Select from 'react-select';
import ville_data from '../../ville_quartier.json';

const villeOptions = ville_data.map(r => ({label: r.ville, value: r.ville}));

export default function EditBien( { idBien, onCancel, onSuccess }){
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("access_token");
    // const {id} = useParams()
    const id = idBien
        const navigate = useNavigate()
        const [formData,setFormData] = useState({
        reference: '',
        type_bien: '',
        type_transaction: '',
        prix: '',
        superficie: '',
        nbr_chambre: '',
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
        terrasse: false,
        garage: false,
        jardin: false,
        balcon: false,
        parking: false,
        piscine: false,
        meuble: false,
        is_validated: false
        })

    const [quartierOption, setQuartierOption] = useState([]);

    useEffect(()=>{
        const fetchBien = async ()=>{
            try{
            const response = await axios.get(`${apiUrl}/bien/api/biens/${id}/`,{
                headers: {
                        'Content-Type': 'application/json',
                         Authorization: `Bearer ${token}`,
                    },
                withCredentials: false,
            })

            setFormData(response.data);
            if (response.data.ville) {
                const quartier = ville_data.filter(elem => elem.ville === response.data.ville)
                .flatMap(q => q.quartiers)
                .map(v => ({ label: v, value: v }));
                setQuartierOption(quartier);
            }}
            catch(err){
                console.error("Erreur: ", err)
            }
        }
        fetchBien()
    },[id])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e)=>{
        e.preventDefault()
        try{
            const response = await axios.put(`${apiUrl}/bien/api/biens/${id}/`,formData,{
                headers: {
                        'Content-Type': 'application/json',
                         Authorization: `Bearer ${token}`,
                    },
            })

            alert('Bien modifié avec succes!');
            onSuccess();
            navigate('/biens');
        }
        catch(error){
            console.error("Erreur: ",error)
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
    }

    return (
        <>
        <div className="modal-overlay ">
      <div className="modal-content bg-white rounded-3">
        <div className="container">
            <h2>Modifier le bien:</h2>
            <form onSubmit={handleSubmit}>
                <div className="row">
                    <div className="col-md-6">
                            <div className="mb-3">
                                <div className="mb-3">
                                <label className="form-label">Reference</label>
                                <input type="number" className="form-control" name="prix" value={formData.reference} onChange={handleChange} required />
                            </div>
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
                    </div>
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">Étage</label>
                            <input type="number" className="form-control" name="etage" value={formData.etage} onChange={handleChange} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Ville</label>
                            <Select name="ville"  value={villeOptions.find(opt => opt.value === formData.ville)} options={villeOptions} 
                            onChange={(selectedOption)=>{
                                const ville = selectedOption.value;
                                const quartier = ville_data.filter(elem => elem.ville === ville).flatMap(q => q.quartiers).map(v => ({ label: v, value: v }));
                                setQuartierOption(quartier);
                                setFormData({...formData, ville: ville, quartier: ''}); // Reset quartier quand ville change
                                }} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Quartier</label>
                            <Select  value={quartierOption.find(opt => opt.value === formData.quartier)} name="quartier" options={quartierOption} onChange={(selectedOption)=>{
                                const quartier = selectedOption.value;
                                setFormData({...formData,quartier})
                            }}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Adresse</label>
                            <input type="text" className="form-control" name="adresse" value={formData.adresse} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Nom du propriétaire</label>
                            <input type="text" className="form-control" name="prop_nom" value={formData.prop_nom} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Prénom du propriétaire</label>
                            <input type="text" className="form-control" name="prop_prenom" value={formData.prop_prenom} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">

                            <input type="tel" className="form-control" name="prop_telephone" value={formData.prop_telephone} placeholder="06 12 34 56 78 ou +212612345678" onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9+ ]/g, '');
                                handleChange({ target: { name: 'prop_telephone', value: val } });
                            }}
                            required/>
                            <small className="text-muted">Saisissez 06... ou +212... ou autre format international</small>
                        </div>
                    </div>
                </div>
                <div className="mb-3">
                    <label className="form-label">Disponibilité</label>
                    <select className="form-select" name="statut_commercial" value={formData.statut_commercial} onChange={handleChange} required>
                        <option value="Disponible">Disponible</option>
                        <option value="Vendu">Déjà Vendu</option>
                        <option value="Retiré">Retiré</option>
                        <option value="Loué">Déjà Loué</option>
                        <option value="Conclu">Déjà Conclu (Rhina)</option>
                    </select>
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
                        <input type="checkbox" className="form-check-input" name="meuble" checked={formData.meuble} onChange={handleChange} />
                        <label className="form-check-label">Meublé</label>
                    </div>
                    <div className="col2 mb-3 form-check">
                        <input type="checkbox" className="form-check-input" name="piscine" checked={formData.piscine} onChange={handleChange} />
                        <label className="form-check-label">Piscine</label>
                    </div>
                </div>
                <div className="mb-3 form-check">
                    <input type="checkbox" className="form-check-input" name="is_validated" checked={formData.is_validated} onChange={handleChange} />
                    <label className="form-check-label">Validé</label>
                </div>
                <button type="submit" className="btn me-3" style={{ backgroundColor: "#fa036b", color: "white" }}>Modifier</button>
                <button onClick={onCancel} className="btn " style={{ backgroundColor: "#eee", color: "#333" }}>Annuler</button>
            </form>
            
        </div>
        </div>
        </div>
        
        </>
    )
}