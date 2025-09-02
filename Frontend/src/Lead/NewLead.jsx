import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import '../assets/styles/lead.css';
import FilterMenu from "./FilterMenu";
import { IoFilter } from "react-icons/io5";


const LeadNouveau = ({ OnRefresh }) => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const token = localStorage.getItem("access_token");
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);
    const [commerciaux, setCommerciaux] = useState([]);
    const [ville, setVille] = useState('');
    const [idCommercial, setIdCommercial] = useState('');
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({ 
        ville: "", 
        degre: "",
        quartier: "",
        statut: "",
        etat_bien: "",
        type_transaction: "",
        nbr_chambre: ""
     });

    const [searchNomTel, setSearchNomTel] = useState("");
    const [filterVille, setFilterVille] = useState("");
    const [filterDegré, setFilterDegré] = useState("");
    // const [data10row, setData10Row] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // nombre de lignes par page

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

    const navigate = useNavigate();

    // const badgeClasses = {
    //   "Affecté": "badge-affecter",
    //   "Non Affecter": "badge-non-affecter",
    //   "A rappeler": "badge-a-rappeler",
    //   "RDV Planifier": "badge-rdv-planifier",
    //   "Non relancer": "badge-non-relancer",
    //   "Opportunité": "badge-opportunite",
    //   "Perdu": "badge-perdu",
    //   "Gagné": "badge-gagne",
    // };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${apiUrl}/lead/leads/`,{
                    headers: {
                        'Content-Type': "application/json",
                        Authorization: `Bearer ${token}` 
            },
                });
                setLeads(res.data.filter(lead => lead.statut === "Nouveau"));
                setLoading(false);
            } catch (error) {
                console.error("Erreur:", error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleOpenModal = (lead) => {
        setSelectedLead(lead);
        fetchCommerciaux();
    };

    const fetchCommerciaux = async () => {
        const res = await axios.get(`${apiUrl}/utilisateur/list_commerciaux/`);
        const sorted = res.data.sort((a, b) => a.nb_leads - b.nb_leads);
        setCommerciaux(sorted);
    };

    const handleAffecter = async () => {
        if (!idCommercial) {
            alert("Veuillez choisir un commercial avant d'affecter.");
            return;
        }

        try {
            await axios.post(`${apiUrl}/lead/affecter_commercial/${selectedLead.id}/`, {
                id_utilisateur: idCommercial,
            });

            alert("Lead affecté avec succès !");
            // Recharger les données après affectation
            const res = await axios.get(`${apiUrl}/lead/leads/`,{
                headers: {
                    'Content-Type': "application/json",
                    Authorization: `Bearer ${token}` 
                    },
            });
            setLeads(res.data.filter(lead => lead.statut === "Nouveau"));
            
            setSelectedLead(null);
            setVille('');
            setIdCommercial('');
        } catch (error) {
            console.error("Erreur lors de l'affectation :", error);
            alert("Erreur lors de l'affectation du lead.");
        }
    };

    const ChangeBackground = (degre_interet) => {
        if(degre_interet === 'Haut'){
            return 'danger';
        }else if(degre_interet === 'Moyen'){
            return 'warning';
        }else{
            return 'primary';
        }
    };

    const filteredCommerciaux = commerciaux.filter(com =>
        com.villes && com.villes.some(v => v.toLowerCase().includes(ville.toLowerCase()))
    );

    // Obtenir la liste des villes uniques pour le select
    const villes = [...new Set(leads.map(lead => lead.quartiers[0]?.ville))];
    const degres = ["Haut", "Moyen", "Faible"];
    // const quartiers = [...new Set(data.map(lead => lead.quartiers[0]?.nom))];
    const quartiers = [
        ...new Set(
            leads.flatMap(lead => lead.quartiers.map(q => q.quartier)) // q.quartier est un tableau
        )
    ];
    const statuts = [...new Set(leads.map(lead => lead.statut))];
    const etatBiens = [...new Set(leads.map(lead => lead.etat_bien))];
    const typesTransaction = [...new Set(leads.map(lead => lead.type_transaction))];
    // const chambres = [...new Set(data.map(lead => lead.nbr_chambre))];
    const chambres = [
        ...new Set(
            leads.flatMap(lead => lead.quartiers.map(q => q.nbr_chambre)).flat() // si c’est un tableau
        )
    ];

    // Filtrer les données
    const filteredData = leads.filter((lead) => {
        const nomTel = (lead.nom + " " + lead.prenom + "0" + lead.telephone).toLowerCase();
        const matchVille = filters.ville ? lead.quartiers[0].ville === filters.ville : true;
        const matchDegre = filters.degre ? lead.degre_interet === filters.degre : true;
        // const matchQuartier = filters.quartier ? lead.quartiers[0]?.nom === filters.quartier : true;
        const matchQuartier = filters.quartier
            ? lead.quartiers.some(q => q.quartier.includes(filters.quartier))
            : true;
        const matchStatut = filters.statut ? lead.statut === filters.statut : true;
        const matchEtatBien = filters.etat_bien ? lead.etat_bien === filters.etat_bien : true;
        const matchType = filters.type_transaction ? lead.type_transaction === filters.type_transaction : true;
        // const matchChambre = filters.nbr_chambre ? lead.nbr_chambre === Number(filters.nbr_chambre) : true;
        const matchChambre = filters.nbr_chambre
            ? lead.quartiers.some(q => q.nbr_chambre === Number(filters.nbr_chambre))
            : true;
        return nomTel.includes(searchNomTel.toLowerCase()) && matchVille && matchDegre&& matchQuartier
    && matchStatut
    && matchType
    && matchChambre;
    });


    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    if (loading) return <div className="text-center mt-5">Chargement...</div>;

    return (
        <div className="container box-shadow">
            <div className="header-table-lead ">
        <h5 className="part1">Liste des leads</h5>
        <div className="part2">
            <input 
                type="text" 
                placeholder="Recherche lead"
                value={searchNomTel}
                onChange={(e) => setSearchNomTel(e.target.value)}
            />
            <button 
                className="btn btn-light"
                onClick={() => setShowFilters(prev => !prev)}
            > 
            <IoFilter /> Filter</button>
            {showFilters && (
                <div 
                    ref={filterMenuRef}
                    style={{
                        position: "absolute",
                        top: "100%",       // juste en dessous du bouton
                        right: "50px",          // aligné à droite
                        width: "500px",
                        zIndex: 1000
                }}>
                    <FilterMenu
                        villes={villes}
                        degres={degres}
                        quartiers={quartiers}
                        statuts={statuts}
                        etatBiens={etatBiens}
                        typesTransaction={typesTransaction}
                        chambres={chambres}
                        onFilterChange={(newFilters) => setFilters(newFilters)}
                        onReset={() => setShowFilters(false)} // ← fermer après reset
                        onClose={() => setShowFilters(false)} // ← fermeture externe
                    />
                </div>
            )}
            {/* <button className="btn btn-primary"> <IoAdd style={{fontSize: "20px"}}/> Add Lead</button> */}
        </div>
        
    </div>
            <div className="table-responsive rounded-3 tableau">
                <table className="table table-bordered">
                    <thead className="header-table">
                        <tr>
                            <th>Nom</th>
                            {/* <th>Prénom</th> */}
                            <th>Téléphone</th>
                            <th>Source</th>
                            <th>Ville</th>
                            <th>Degré d'intérêt</th>
                            <th>Changer statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentRows.map(lead => (
                            <tr key={lead.id}>
                                <td>{lead.nom} {lead.prenom}</td>
                                {/* <td></td> */}
                                <td>{lead.telephone}</td>
                                <td>
                                    <span 
                                    className="badge"
                                    style={{
                                        backgroundColor: lead.source === "Web" ? "#f8d7da" : "#cfe2ff",
                                        color: lead.source === "Web" ? "#dc3545" : "#0d6efd",
                                        border: "1px solid transparent",
                                        padding: "7px 15px",
                                        borderRadius: "16px"
                                    }}
                                    >
                                        {lead.source}
                                    </span>
                                </td>
                                <td>{lead.quartiers[0]?.ville}</td>
                                {/* <td>
                                    <span className={`badge bg-${ChangeBackground(lead.degre_interet)}`}>
                                        {lead.degre_interet}
                                    </span>
                                </td> */}
                                <td>
                                    <span
                                        className={`badge-modern ${
                                        lead.degre_interet === "Haut"
                                            ? "badge-haut"   // rouge clair + texte rouge foncé
                                            : lead.degre_interet === "Moyen"
                                            ? "badge-moyen" // jaune clair + texte orange
                                            : "badge-bas"   // vert clair + texte vert
                                        }`}
                                    >
                                        {lead.degre_interet}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn" style={{ backgroundColor: "#fa036b", color: "white" }} onClick={() => handleOpenModal(lead)}>
                                        Affecter
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="d-flex justify-content-between align-items-center div-pagination">
                <div className="div-text-pagination">
                    Affichage de {(filteredData.length === 0) ? indexOfFirstRow :  indexOfFirstRow + 1} à {Math.min(indexOfLastRow, filteredData.length)} sur {filteredData.length} leads
                </div>
                <div className="div-btn-pagination ">
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
                        className={`btn  ${currentPage === number ? "btne-primary" : "btne-light"}`}
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

            {selectedLead && (
                <div className="modal-overlay ">
                    <div className="modal-content bg-white" style={{ 
                        width: "500px",
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        color: "rgb(33,37,41)",
                        fontSize: "14px",
                        lineHeight: "21px"
                        }}>
                        <h4>Affecter un commercial à {selectedLead.nom} {selectedLead.prenom}</h4>
                        <div className="mb-3">
                            <label className="form-label">Filtrer par ville :</label>
                            <input 
                                className="form-control"
                                value={ville} 
                                onChange={e => setVille(e.target.value)} 
                            />
                        </div>
                        <div className="mb-3">
                            <select 
                                className="form-select"
                                onChange={e => setIdCommercial(e.target.value)}
                                value={idCommercial}
                            >
                                <option value="">-- Choisir un commercial --</option>
                                {filteredCommerciaux.map(com => (
                                    <option key={com.id} value={com.id}>
                                        {com.nom} {com.prenom} — ({com.nbr_lead || 0})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="d-flex gap-2">
                            <button className="btn btn-primary" onClick={handleAffecter}>
                                Affecter
                            </button>
                            <button className="btn btn-light" onClick={() => setSelectedLead(null)}>
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadNouveau;