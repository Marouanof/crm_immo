import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../assets/styles/lead.css";
import Modal from '../Lead/Modal';
import EditBien from './editBien';
import { FaEdit, FaTrash } from 'react-icons/fa';

const BienNonValides = ({ onCancel }) => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [biens, setBiens] = useState([]);
    const [idBien,setIdBien] = useState(0);
    const [showBienModal, setShowBienModal] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("access_token");

    // Récupère les biens non validés
    useEffect(() => {

        axios.get(`${apiUrl}/bien/api/biens/?is_validated=false`,{
            headers: {
                        'Content-Type': 'application/json',
                         Authorization: `Bearer ${token}`,
                    },
        })
            .then(res => setBiens(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleDelete = async (id)=>{
        if(window.confirm('Êtes-vous sûr de vouloir supprimer ce bien ?')){
            try{
                await  axios.delete(`${apiUrl}/bien/api/biens/${id}`,{
                    headers:{
                        'Content-Type' : 'application/json',
                        Authorization : `Bearer ${token}`,
                    },
                    withCredentials: false,
                })
                setBiens(biens.filter(bien => bien.id !== id))
                alert('Bien supprimé avec succès')
            }
            catch(err){
                console.error("Erreur lors de la suppression.",err)
                alert('Erreur lors de la suppression du bien.')
            }
            }
    }

    return (
        <>
        <div className="modal-overlay ">
      <div className="modal-content bg-white rounded-3">
        <div className="container">
            <div className="d-flex justify-content-between mb-4">
                <h2>
                    <i className="bi bi-hourglass-split text-warning me-2"></i>
                    Biens en attente
                </h2>
                <button 
                    className="btn btn-outline-primary"
                    onClick={onCancel}
                >
                    Annuler
                </button>
            </div>

            {biens.length === 0 ? (
                <div className="alert alert-success">
                    Aucun bien en attente de validation
                </div>
            ) : (
                <div className="table-responsive rounded-3 tableau">
                    <table className="table table-bordered">
                        <thead className="head-table">
                            <tr>
                                <th></th>
                                <th>Référence</th>
                                <th>Type de bien</th>
                                <th>Transaction</th>
                                <th>Prix</th>
                                <th>Superficie (m²)</th>
                                <th>Chambres</th>
                                <th>Étage</th>
                                <th>Ville</th>
                                <th>Quartier</th>
                                {/* <th>Adresse</th>
                                <th>Propriétaire</th>
                                <th>Téléphone</th> */}
                                <th>Statut</th>
                                <th>Importance</th>
                                {/* <th>Responsable</th> */}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {biens.map(bien => (
                                <tr key={bien.id}>
                                    <td>
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox"/>
                                        </div>
                                    </td>
                                    <td>{bien.reference}</td>
                                    <td>{bien.type_bien}</td>
                                    <td>{bien.type_transaction}</td>
                                    <td>{bien.prix} dhs</td>
                                    <td>{bien.superficie}</td>
                                    <td>{bien.nbr_chambre}</td>
                                    <td>{bien.etage || '-'}</td>
                                    <td>{bien.ville}</td>
                                    <td>{bien.quartier}</td>
                                    {/* <td>
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${bien.adresse}, ${bien.quartier}, ${bien.ville}`} target="_blank" rel="noopener noreferrer" className="text-primary">
                                        {bien.adresse} 
                                        </a>
                                    </td> */}
                                    {/* <td>
                                        {bien.prop_nom} {bien.prop_prenom}
                                    </td> */}
                                    {/* <td>{bien.prop_telephone}</td> */}
                                    <td>{bien.statut_commercial}</td>
                                    <td>{bien.degre_importance}</td>
                                    {/* <td>{bien.responsable_nom} {bien.responsable_prenom}</td> */}
                                    <td>
                                        <div className="d-flex">
                                            <button className="btn btn-sm btn-warning" onClick={() => {
                                                    setIdBien(bien.id);
                                                    setShowBienModal(true);
                                                } }> <FaEdit /> </button>
                                            <button className="btn btn-danger" onClick={()=>{handleDelete(bien.id)}}> <FaTrash /> </button>
                                        </div>
                                        
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Modal isOpen={showBienModal} onClose={() => setShowBienModal(false)}>
                <EditBien  idBien ={ idBien} onCancel={()=> setShowBienModal(false)}/>
            </Modal>
        </div>
        </div>
        </div>
        </>
    );
};

export default BienNonValides;