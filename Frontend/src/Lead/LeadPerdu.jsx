import {React, useState , useEffect, useCallback, useRef}from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../assets/styles/lead.css";
import FilterMenu from "./FilterMenu";
import { IoFilter } from 'react-icons/io5';
import { FaEdit } from 'react-icons/fa';

const LeadPerdu = () =>{
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [leadsPerdus, setLeadsPerdus] = useState([]);
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

    const badgeClasses = {
      "Affecté": "badge-affecter",
      "Non Affecter": "badge-non-affecter",
      "A rappeler": "badge-a-rappeler",
      "RDV Planifier": "badge-rdv-planifier",
      "Non relancer": "badge-non-relancer",
      "Opportunité": "badge-opportunite",
      "Perdu": "badge-perdu",
      "Gagné": "badge-gagne",
    };

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

     useEffect(() => {
        const fetchLeadsPerdus = async () => {
            try {
                // const res = await axios.get('http://127.0.0.1:8000/lead/leads/');
                // setLeadsPerdus(res.data.filter(lead => lead.statut === 'Perdu'));
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
                  setLeadsPerdus(allData.filter(b => b.statut === "Perdu"));
                }
                else{
                  const res = await axios.get(`${apiUrl}/lead/leads/`,{
                    headers: {
                      'Content-Type': "application/json",
                      Authorization: `Bearer ${token}` 
                    },
                  });
                  setLeadsPerdus(res.data.filter(lead => lead.statut === 'Perdu'));
                }
            } catch (error) {
                console.error('Erreur:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeadsPerdus();
    }, []);

    // Obtenir la liste des villes uniques pour le select
    const villes = [...new Set(leadsPerdus.map(lead => lead.quartiers[0].ville))];
    const degres = ["Haut", "Moyen", "Faible"];
    // const quartiers = [...new Set(data.map(lead => lead.quartiers[0]?.nom))];
    const quartiers = [
        ...new Set(
            leadsPerdus.flatMap(lead => lead.quartiers.map(q => q.quartier)) // q.quartier est un tableau
        )
    ];
    const statuts = [...new Set(leadsPerdus.map(lead => lead.statut))];
    const etatBiens = [...new Set(leadsPerdus.map(lead => lead.etat_bien))];
    const typesTransaction = [...new Set(leadsPerdus.map(lead => lead.type_transaction))];
    // const chambres = [...new Set(data.map(lead => lead.nbr_chambre))];
    const chambres = [
        ...new Set(
            leadsPerdus.flatMap(lead => lead.quartiers.map(q => q.nbr_chambre)).flat() // si c’est un tableau
        )
    ];

    // Filtrer les données
    const filteredData = leadsPerdus.filter((lead) => {
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
            {/* <button className="btn btn-primary"> <IoAdd style={{fontSize: "20px"}}/> Add Lead</button> */}
        </div>
        
      </div>
    <div className="table-responsive rounded-3 tableau">
        <table className="table table-bordered ">
          <thead className="head-table">
            <tr>
              <th></th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Source</th>
              <th>Motif</th>
              <th>Commentaires</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((lead, index) => (
              <tr key={index}>
                <td onClick={() => navigate(`../leadInfo/${lead.id}`)}>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox"/>
                  </div>
                </td>
                <td>{lead.nom}</td>
                <td>{lead.prenom}</td>
                <td>{lead.email}</td>
                <td>{'0' + lead.telephone}</td>
                {/* <td>
                  <span className={`badge bg-${lead.source === 'Web' ? 'danger' : 'secondary'}`}>
                    {lead.source}
                  </span>
                </td> */}
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
                  <td>{lead.commentaires?.find(c => c.nouveau_statut === 'Perdu')?.motif_perte}</td>
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
                                    }}>
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
                {/* <td onClick={()=>{setLeadStatut(lead)}}>{lead.statut}</td> */}
                <td>
                  <span className={badgeClasses[lead.statut] || "badge-non-affecter"}>{lead.statut}</span>
                </td>
               </tr>
            ))}
          </tbody>
        </table>
        </div>
        <div className="d-flex justify-content-between align-items-center div-pagination">
                <div className="div-text-pagination">
            Affichage de {(filteredData.length === 0) ? indexOfFirstRow :  indexOfFirstRow + 1} à {Math.min(indexOfLastRow, filteredData.length)} sur {filteredData.length} entrées
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
    </>
)
};

export default LeadPerdu;