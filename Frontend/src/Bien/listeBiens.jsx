import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ActionMenu from './ActionMenuBien';
import InfoBien from './InfoBien';
import "../assets/styles/lead.css";
import { IoAdd, IoFilter } from "react-icons/io5";
import FilterMenuBien from './FilterMenuBien';
import Modal from '../Lead/Modal';
import NavbarLead from '../Lead/NavbarLead';
import EditBien from './editBien';
import AddBien from './addBien';
import BienNonValides from './BienNonValides';

const ListBiens = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [biens, setBiens] = useState([]);
    const [allBiens, setAllBiens] = useState([]); // Conserve tous les biens non filtrés
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);
    const [error, setError] = useState(null);
    const [dispoLeads, setDispoLeads] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("access_token");
    const [refreshNavbar, setRefreshNavbar] = useState(0);
  
    const refreshNavbarNotifications = () => {
        setRefreshNavbar(prev => prev + 1);
    };

    const refreshAllData = () => {
        fetchBiens();
        refreshNavbarNotifications();
    }

    // Filtres
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        type_bien: '',
        statut_commercial: '',
        type_transaction: '',
        nbr_chambre: '',
        degre_importance: '',
        prix_min: '',
        prix_max: '',
        surface_min : '',
        surface_max : '',
        etat_bien: '',
        ascenseur: '',
        jardin : '',
        garage : '',
        terrasse : ''
    });

    // Pour l'association aux leads
    const [idBien,setIdBien] = useState(0);
    const [selectedLead, setSelectedLead] = useState(null);
    const [leads, setLeads] = useState([]);
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [showBienModal, setShowBienModal] = useState(false);
    const [showAddBienModal, setShowAddBienModal] = useState(false);
    const [showAttentModal, setShowAttentModal] = useState(false);
    const [leadSearchTerm, setLeadSearchTerm] = useState('');
    const [selectedBien, setSelectedBien] = useState(null);
    const [selectedInfoBien, setSelectedInfoBien] = useState(null);

    const filterMenuRef = useRef(null);

    // Fermer si clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                setShowFilters(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bien ?')) {
            try {
                await axios.delete(`${apiUrl}/bien/api/biens/${id}/`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: false,
                });
                setBiens(biens.filter(bien => bien.id !== id));
                setAllBiens(allBiens.filter(bien => bien.id !== id));
                alert('Bien supprimé avec succès!');

                refreshAllData();
            } catch (err) {
                console.error("Erreur lors de la suppression:", err);
                alert('Erreur lors de la suppression du bien');
            }
        }
    };

    const role = localStorage.getItem('role');

    const fetchBiens = useCallback(async () => {
            try {
                const params = {
                is_validated: true,
                ...(filters.type_bien && { type_bien: filters.type_bien }),
                ...(filters.etat_bien && { etat_bien: filters.etat_bien }),
                // ...(filters.etat_bien && filters.etat_bien !== "all" && { etat_bien: filters.etat_bien }),
                ...(filters.statut_commercial && { statut_commercial: filters.statut_commercial }),
                ...(filters.type_transaction && { type_transaction: filters.type_transaction }),
                ...(filters.nbr_chambre && { chambres: [filters.nbr_chambre] }), // Modifié ici
                ...(filters.degre_importance && { degre_importance: filters.degre_importance }),
                ...(filters.prix_min && { prix_min: filters.prix_min }),
                ...(filters.prix_max && { prix_max: filters.prix_max }),
                ...(filters.surface_min && { surface_min: filters.surface_min }),
                ...(filters.surface_max && { surface_max: filters.surface_max }),
                ...(filters.ascenseur && { ascenseur: filters.ascenseur }), 
                ...(filters.jardin && { jardin: filters.jardin }),
                ...(filters.garage && { garage: filters.garage }), 
                ...(filters.terrasse && { terrasse: filters.terrasse }),  
                ...(searchTerm && { reference: searchTerm })
            };

            const response = await axios.get(`${apiUrl}/bien/api/biens/`, {
                params,
                paramsSerializer: params => {
                    return new URLSearchParams(params).toString();
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            // Récupérer le nombre de biens en attente
            const pendingResponse = await axios.get(`${apiUrl}/bien/api/biens/?is_validated=false`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingCount(pendingResponse.data.length);

            if(role === "admin"){
                setBiens(response.data);
                setAllBiens(response.data); // Stocke tous les biens pour les filtres locaux
            }
            else{
                setBiens(response.data.filter(bien => bien.statut_commercial === "Disponible"));
                setAllBiens(response.data); // Stocke tous les biens pour les filtres locaux
            }
            
            
            setLoading(false);
        } catch (err) {
            setError(err.message || 'Erreur lors de la récupération des biens');
            setLoading(false);
        }
    }, [filters, searchTerm, token]);

    const fetchLeads = async () => {
        try {
            const response = await axios.get(`${apiUrl}/lead/leads/`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: false,
            });
            setLeads(response.data);
            setDispoLeads(response.data.filter(b => b.statut !== 'Gagné' && b.statut !== 'Perdu'));
        } catch (err) {
            console.error("Erreur lors de la récupération des leads:", err);
        }
    };

    const associateBienToLead = async () => {
        if (!selectedLead || !selectedBien) {
            alert('Veuillez sélectionner un lead');
            return;
        }

        try {
            await axios.post(
                `${apiUrl}/lead/associer-bien/${selectedLead.id}/`,
                { biens_ids: [selectedBien.id] },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: false,
                }
            );
            alert('Bien associé au lead avec succès!');
            setShowLeadModal(false);
            setSelectedLead(null);
            setSelectedBien(null);

            refreshAllData();
        } catch (err) {
            console.error("Erreur lors de l'association:", err);
            alert('Erreur lors de l\'association du bien au lead');
        }
    };

    useEffect(() => {
        fetchBiens();
    }, [fetchBiens]);

    // Obtenir les valeurs uniques pour les filtres
    const typesUniques = [...new Set(allBiens.map(bien => bien.type_bien))];
    const etatsUniques = [...new Set(allBiens.map(bien => bien.etat_bien))];
    const statutsUniques = [...new Set(allBiens.map(bien => bien.statut_commercial))];
    const transactionsUniques = [...new Set(allBiens.map(bien => bien.type_transaction))];
    const chambresUniques = [...new Set(allBiens.map(bien => bien.nbr_chambre))];
    const importancesUniques = [...new Set(allBiens.map(bien => bien.degre_importance))];

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = biens.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(biens.length / rowsPerPage);

    if(loading) return <div className="text-center mt-5"> Chargement ...</div>;

    return (
        <>
        <NavbarLead 
            titre="Biens"
            onRefresh={refreshNavbar}
         />
            <div className="container box-shadow mt-3">
                
                <div className="header-table-lead">
                    <h5 className="part1">Liste des biens immobiliers</h5>
                    <div className="part2">
                        <input 
                            type="text" 
                            placeholder="Rechercher référence..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchBiens()}
                        />
                        <button 
                            className="btn btn-light"
                            onClick={() => setShowFilters(prev => !prev)}
                        > 
                            <IoFilter /> Filter
                        </button>
                        {showFilters && (
                            <div 
                                ref={filterMenuRef}
                                style={{
                                    position: "absolute",
                                    top: "100%",
                                    right: "0px",
                                    width: "300px",
                                    zIndex: 1000
                            }}>
                                <FilterMenuBien
                                    types={typesUniques}
                                    etats={etatsUniques}
                                    statuts={statutsUniques}
                                    transactions={transactionsUniques}
                                    chambres={chambresUniques}
                                    importances={importancesUniques}
                                    currentFilters={filters}
                                    onFilterChange={(newFilters) => {
                                        setFilters(newFilters);
                                        setCurrentPage(1); // Reset à la première page lors du filtrage
                                    }}
                                    onApply={()=>{fetchBiens();
                                        setShowFilters(false);
                                    }}
                                    onReset={() => {
                                        setFilters({
                                            type_bien: '',
                                            etat_bien: '',
                                            statut_commercial: '',
                                            type_transaction: '',
                                            nbr_chambre: '',
                                            degre_importance: '',
                                            prix_min: '',
                                            prix_max: '',
                                            surface_min : '',
                                            surface_max : '',
                                        });
                                        fetchBiens();
                                        setShowFilters(false);
                                    }}
                                />
                            </div>
                        )}
                        {role !== "assistant" && (
                            <button id="btn-add-lead" className="btn add-btn" onClick={() => setShowAddBienModal(true)}>
                                <IoAdd style={{fontSize: "20px"}}/> Ajouter un bien
                            </button>
                        )}
                        {role !== "assistant" && (
                            <button className="btn btn-warning ms-2" onClick={() => setShowAttentModal(true)}>
                                En attente ({pendingCount})
                            </button>
                        )}
                    </div>
                </div>

                <div className="rounded-3 tableau">
                    <table className="table table-bordered">
                        <thead className="head-table">
                            <tr>
                                <th></th>
                                <th className="ps-3">Référence</th>
                                <th>Type de bien</th>
                                <th>Transaction</th>
                                <th>Etat Bien</th>
                                <th>Prix</th>
                                <th>Superficie</th>
                                <th>Ville</th>
                                <th>Quartier</th>
                                <th>Lien Maps</th>
                                <th>Disponibilité</th>
                                <th>Importance</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRows.map((bien) => (
                                <tr key={bien.reference}>
                                    <td onClick={() => setSelectedInfoBien(bien)}>
                                        <div className="form-check">
                                            <input className="form-check-input" type="checkbox"/>
                                        </div>
                                    </td>
                                    <td className="ps-3">{bien.reference}</td>
                                    <td>{bien.type_bien}</td>
                                    <td>{bien.type_transaction}</td>
                                    <td>{bien.etat_bien}</td>
                                    <td>{bien.prix} dhs</td>
                                    <td>{bien.superficie} m²</td>
                                    <td>{bien.ville}</td>
                                    <td>{bien.quartier}</td>
                                    <td>
                                        <a 
                                            href={`${bien.adresse}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-primary"
                                        >
                                            Voir sur Maps
                                        </a>
                                    </td>
                                    <td>{(bien.statut_commercial === 'Disponible' || bien.statut_commercial === 'Retiré')? bien.statut_commercial : "Déjà " + bien.statut_commercial}</td>
                                    <td>{bien.degre_importance}</td>
                                    <td>
                                        <ActionMenu
                                            onEdit={() => {
                                                setIdBien(bien.id);
                                                setShowBienModal(true);
                                            } }
                                            onAssociate={() => {
                                                setSelectedBien(bien);
                                                fetchLeads();
                                                setShowLeadModal(true);
                                            }}
                                            onInfo={() => setSelectedInfoBien(bien)}
                                            onDelete={() => handleDelete(bien.id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="d-flex justify-content-between align-items-center div-pagination">
                    <div className="div-text-pagination">
                        Affichage de {(biens.length === 0) ? indexOfFirstRow : indexOfFirstRow + 1} à {Math.min(indexOfLastRow, biens.length)} sur {biens.length} biens
                    </div>
                    <div className="div-btn-pagination">
                        <button
                            className="btn btn-light"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            &lt;
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                            <button
                                key={number}
                                className={`btn ${currentPage === number ? "btne-primary" : "btne-light"}`}
                                onClick={() => setCurrentPage(number)}
                            >
                                {number}
                            </button>
                        ))}

                        <button
                            className="btn btn-light btn-pers"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>

            {selectedInfoBien && (
                <InfoBien bien={selectedInfoBien} onClose={() => setSelectedInfoBien(null)} />
            )}

            <Modal isOpen={showAddBienModal} onClose={() => setShowAddBienModal(false)}>
                <AddBien 
                        onCancel={()=> setShowAddBienModal(false)}
                        onSuccess={refreshAllData}
                />
            </Modal>

            <Modal isOpen={showAttentModal} onClose={() => setShowAttentModal(false)}>
                <BienNonValides onCancel={()=> setShowAttentModal(false)}/>
            </Modal>

            <Modal isOpen={showBienModal} onClose={() => setShowBienModal(false)}>
                <EditBien  
                        idBien ={ idBien} 
                        onCancel={()=> setShowBienModal(false)}
                        onSuccess={refreshAllData}
                />
            </Modal>

            <Modal isOpen={showLeadModal} onClose={() => {
                setShowLeadModal(false);
                setSelectedLead(null);
                setLeadSearchTerm('');
            }}>
                <div className="modal-overlay ">
                {/* <div className="modal-content bg-white rounded-3"> */}
                <div className="modal-content bg-white rounded-3">
                    <div className="modal-header">
                        <h5 className="modal-title">Sélectionner un lead</h5>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Rechercher un lead par nom, téléphone ou type de bien..."
                                value={leadSearchTerm} 
                                onChange={(e) => setLeadSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {dispoLeads
                                .filter(lead => 
                                    lead.nom.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
                                    lead.telephone.toString().includes(leadSearchTerm) ||
                                    lead.type_bien.toLowerCase().includes(leadSearchTerm.toLowerCase()) ||
                                    lead.etat_bien.toLowerCase().includes(leadSearchTerm.toLowerCase())
                                )
                                .map(lead => (
                                    <button
                                        key={lead.id}
                                        type="button"
                                        className={`list-group-item list-group-item-action ${selectedLead?.id === lead.id ? 'active' : ''}`}
                                        onClick={() => setSelectedLead(lead)}
                                    >
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <strong>{lead.nom} {lead.prenom}</strong><br />
                                                <small>{lead.telephone}</small>
                                            </div>
                                            <div className="text-end">
                                                {lead.type_bien}<br />
                                                {lead.etat_bien}<br />
                                                <small>{lead.budget} dhs</small><br />
                                                <small>{lead.type_transaction}</small>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={() => {
                                setShowLeadModal(false);
                                setSelectedLead(null);
                                setLeadSearchTerm(''); 
                            }}
                        >
                            Annuler
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary" 
                            onClick={associateBienToLead}
                            disabled={!selectedLead}
                        >
                            Confirmer l'association
                        </button>
                    </div>
                </div>
                </div>
                {/* </div> */}
            </Modal>
        </>
    );
};

export default ListBiens;