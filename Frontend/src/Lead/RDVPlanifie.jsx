import React, { useState, useEffect,useCallback, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UpdateRDV from './UpdateRDV';
import "../assets/styles/lead.css";
import FilterMenu from "./FilterMenu";
import { IoFilter } from 'react-icons/io5';
import { FaEdit } from 'react-icons/fa';


const RDVPlanifie = ({ onRefresh }) => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [allLeads, setAllLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leadStatut,setLeadStatut] = useState(null);
    const [associatedBiens, setAssociatedBiens] = useState({}); // {leadId: [biens]}
    const [showModal, setShowModal] = useState(false);
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

    const fetchLeads = async () => {
        try {
            // const res = await axios.get("http://localhost:8000/lead/leads_rdv/");
            // setAllLeads(res.data);
            const token = localStorage.getItem('access_token');
            const role = localStorage.getItem('role');
            const id_user = localStorage.getItem('id_user');
            if( role === "commercial"){
              const res = await axios.get(`${apiUrl}/lead/leadCommercial/${id_user}/`,{
                headers: {
                  'Content-Type': "application/json",
                  Authorization: `Bearer ${token}` 
                },
              });
              const allData = res.data;
              const allDataRDV = allData.filter(b => b.statut === "RDV planifié");
            //   console.log("data du rdv planifier ", allData.filter(b => b.statut === "RDV planifié"))
              setAllLeads(allDataRDV);
              // Récupérer les biens associés pour chaque lead
                const biensData = {};
                await Promise.all(allDataRDV.map(async (lead) => {
                    try {
                        const biensRes = await axios.get(`${apiUrl}/lead/associated-biens/${lead.id}/`);
                        biensData[lead.id] = biensRes.data;
                    } catch (error) {
                        console.error(`Erreur pour le lead ${lead.id}:`, error);
                        biensData[lead.id] = [];
                    }
                }));
                setAssociatedBiens(biensData);
            }
            else{
              const res = await axios.get(`${apiUrl}/lead/leads_rdv/`);
              setAllLeads(res.data);
              // Récupérer les biens associés pour chaque lead
                const biensData = {};
                await Promise.all(res.data.map(async (lead) => {
                    try {
                        const biensRes = await axios.get(`${apiUrl}/lead/associated-biens/${lead.id}/`);
                        biensData[lead.id] = biensRes.data;
                    } catch (error) {
                        console.error(`Erreur pour le lead ${lead.id}:`, error);
                        biensData[lead.id] = [];
                    }
                }));
                setAssociatedBiens(biensData);
            }
            
            
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdateSuccess = useCallback(() => {
                 fetchLeads(); // Rafraîchit toutes les données
             }, [fetchLeads]);

    useEffect(() => {
        fetchLeads();
    }, []);

    // Obtenir la liste des villes uniques pour le select
    const villes = [...new Set(allLeads.map(lead => lead.quartiers[0]?.ville))];
    const degres = ["Haut", "Moyen", "Faible"];
    // const quartiers = [...new Set(data.map(lead => lead.quartiers[0]?.nom))];
    const quartiers = [
        ...new Set(
            allLeads.flatMap(lead => lead.quartiers.map(q => q.quartier)) // q.quartier est un tableau
        )
    ];
    const statuts = [...new Set(allLeads.map(lead => lead.statut))];
    const etatBiens = [...new Set(allLeads.map(lead => lead.etat_bien))];
    const typesTransaction = [...new Set(allLeads.map(lead => lead.type_transaction))];
    // const chambres = [...new Set(data.map(lead => lead.nbr_chambre))];
    const chambres = [
        ...new Set(
            allLeads.flatMap(lead => lead.quartiers.map(q => q.nbr_chambre)).flat() // si c’est un tableau
        )
    ];

    // Filtrer les données
    const filteredData = allLeads.filter((lead) => {
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
        && matchEtatBien
        && matchType
        && matchChambre;
    });

    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    if (loading) return <div className="text-center mt-5">Chargement...</div>;

    return (
        <>
            <div className="container box-shadow">
                <div className="header-table-lead">
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
                        </div>
                        
                    </div>
                <div className="table-responsive rounded-3 tableau">
                    <table className="table table-bordered">
                        <thead className="head-table">
                            <tr>
                                <th></th>
                                <th>Nom</th>
                                <th>Téléphone</th>
                                <th>Date RDV</th>
                                <th>Lieu</th>
                                <th>Biens associés</th>
                                <th>Commentaires</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentRows.map((lead) => (
                                <tr key={lead.id}>
                                    <td onClick={() => navigate(`../leadInfo/${lead.id}`)}>
                                      <div className="form-check">
                                        <input className="form-check-input" type="checkbox"/>
                                      </div>
                                    </td>
                                    <td>{lead.nom} {lead.prenom}</td>
                                    <td>{'0' + lead.telephone}</td>
                                    <td>{new Date(lead.dernier_rdv.date_rdv).toLocaleString()}</td>
                                    <td>{lead.dernier_rdv.lieu}</td>
                                    <td>
                                        {associatedBiens[lead.id]?.length > 0 ? (
                                            <ul>
                                                {associatedBiens[lead.id].map((bien, index) => (
                                                    <span key={index} className="bg-dispo ms-2">
                                                        {bien.reference}
                                                    </span>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="bg-non-dispo">Aucun bien associé</span>
                                        )}
                                    </td>
                                    {/* <td>
                                        {lead.commentaires?.length > 0 ? (
                                            <ul className="list-unstyled">
                                                {lead.commentaires.map((comment, idx) => (
                                                    <li key={idx} className="mb-2">
                                                        <small><strong>{comment.utilisateur}</strong> ({new Date(comment.date_creation).toLocaleString()}):<br />
                                                        {comment.contenue}<br />
                                                        <span className="text-muted bg-non-dispo" 
                                                            style={{
                                                                padding: "5px 10px",
                                                                borderRadius: "12px",
                                                            }}
                                                        >
                                                            {comment.ancien_statut} → {comment.nouveau_statut}
                                                        </span>
                                                        </small>
                                                    </li>))}
                                            </ul>
                                        ) : (
                                            <span className="badge bg-secondary">Aucun commentaire</span>
                                        )}
                                    </td> */}
                                    <td>
                                        {lead.commentaires?.length > 0 ? (
                                            (() => {
                                            const lastComment = lead.commentaires[lead.commentaires.length - 1];
                                            return (
                                                <div>
                                                <small>
                                                    <strong>{lastComment.utilisateur}</strong> ({new Date(lastComment.date_creation).toLocaleString()}):<br />
                                                    {lastComment.contenue}<br />
                                                    <span className="text-muted bg-non-dispo"
                                                    style={{
                                                        padding: "5px 10px",
                                                        borderRadius: "12px",
                                                    }}
                                                    >
                                                    {lastComment.ancien_statut} → {lastComment.nouveau_statut}
                                                    </span>
                                                </small>
                                                </div>
                                            );
                                            })()
                                        ) : (
                                            <span className="badge bg-secondary">Aucun commentaire</span>
                                        )}
                                    </td>
                                    {/* <td><button onClick={() => setLeadStatut(lead)}>
                                            {lead.statut}
                                        </button>
                                    </td> */}
                                    <td>
                                      <button className="btn " style={{ backgroundColor: "#fa036b", color: "white" }} onClick={() => setLeadStatut(lead)}>
                                        <FaEdit />
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
</div>

            {leadStatut && (
                <UpdateRDV lead={leadStatut} onClose={() => setLeadStatut(null)} onSuccess={() => {
                    handleStatusUpdateSuccess();
                    fetchLeads();
                    onRefresh();
                }}
                />
            )}
        </>
    );
};

export default RDVPlanifie;
