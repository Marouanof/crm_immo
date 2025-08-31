import {React, useState , useEffect, useRef, useCallback}from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UpdateLead from "./UpdateLead";
import UpdateStatut from "./UpdateStatut";
import PropositionsButton from './PropositionsButton';
import { FaEdit, FaTrash } from "react-icons/fa";
import { IoAdd, IoFilter } from "react-icons/io5";
import "../assets/styles/lead.css";
import ActionMenuLead from "./ActionMenuLead";
import FilterMenu from "./FilterMenu";
import BiensProposes from "./BiensProposes";
import Modal from "./Modal";

const Affecté = ({ onRefresh}) =>{
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leadEdit, setLeadEdit] = useState(null);
    const [lead, setLead] = useState([]);
    const [leadStatut,setLeadStatut] = useState(null);
    const [associatedBiens, setAssociatedBiens] = useState({});
    const [updateLead, setUpdateLead] = useState(null); 
    const [selectedLead, setSelectedLead] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showPropositionModal, setShowPropositionModal] = useState(false);
    

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
    const [filterDegre, setFilterDegre] = useState("");
    // const [data10row, setData10Row] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // nombre de lignes par page
    const filterMenuRef = useRef(null);
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

    const fetchLeads = useCallback (async ()=>{
      try{
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
          setData(allData.filter(b => b.statut === "Affecté"));
          const biensData = {};
          await Promise.all(allData.map(async (lead) => {
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
          const res = await axios.get(`${apiUrl}/lead/leads/`,{
            headers: {
              'Content-Type': "application/json",
              Authorization: `Bearer ${token}` 
            },
          });
          const allData = res.data;
          setData(allData.filter(b => b.statut === "Affecté"));
          const biensData = {};
          await Promise.all(allData.map(async (lead) => {
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
        // const res = await axios.get("http://127.0.0.1:8000/lead/leads/",{
        //   headers: {
        //     'Content-Type': "application/json",
        //     Authorization: `Bearer ${token}` 
        //   },
        // });
        // const allData = res.data;
        // setData(allData.filter(b => b.statut === "Affecté")); 
        // Récupérer les biens associés pour chaque lead
        // const biensData = {};
        // await Promise.all(data.map(async (lead) => {
        // try {
        //   const biensRes = await axios.get(`http://localhost:8000/lead/associated-biens/${lead.id}/`);
        //   biensData[lead.id] = biensRes.data;
        // } catch (error) {
        //   console.error(`Erreur pour le lead ${lead.id}:`, error);
        //   biensData[lead.id] = [];
        // }
        // }));
        // setAssociatedBiens(biensData);
      }
      catch(error){
         console.error("Erreur:", error);
      }
      finally{
        setLoading(false);
      }
    },[]);


    useEffect(() => {
      fetchLeads();
        
    }, []);


    
    const handleStatusUpdateSuccess = useCallback(() => {
         fetchLeads(); // Rafraîchit toutes les données
     }, [fetchLeads]);

    const handleEdit = (leadId) => {
        setLeadEdit(leadId);
    }

    const handleDelete = async (id) => {
        if(window.confirm("Voulez-vous vraiment supprimer cet lead?")){
            await axios.delete(`${apiUrl}/lead/delete_lead/${id}/`)
            .then(async () => {
                alert('Lead est supprimer avec succès');
                await fetchLeads();

            })
            .catch((error) =>{
                console.log("erreur lors de la suppression :", error);
                alert('Echec de la suppression');
            });
            }
        
    }

    const Resset = () => {
      fetchLeads();
    }

    const handleProposeBiens = (lead) => {
        setShowPropositionModal(true);
        setSelectedLead(lead);
    };

    // Obtenir la liste des villes uniques pour le select
    const villes = [...new Set(data.map(lead => lead.quartiers[0]?.ville))];
    const degres = ["Haut", "Moyen", "Faible"];
    // const quartiers = [...new Set(data.map(lead => lead.quartiers[0]?.nom))];
    const quartiers = [
        ...new Set(
            data.flatMap(lead => lead.quartiers.map(q => q.quartier)) // q.quartier est un tableau
        )
    ];
    const statuts = [...new Set(data.map(lead => lead.statut))];
    const typesTransaction = [...new Set(data.map(lead => lead.type_transaction))];
    const etatBiens = [...new Set(data.map(lead => lead.etat_bien))];
    // const chambres = [...new Set(data.map(lead => lead.nbr_chambre))];
    const chambres = [
        ...new Set(
            data.flatMap(lead => lead.quartiers.map(q => q.nbr_chambre)).flat() // si c’est un tableau
        )
    ];

    // Filtrer les données
    const filteredData = data.filter((lead) => {
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


    if(loading) return <div className="text-center mt-5"> Chargement ...</div>;

    return (
    <>
    {/* <Navbar /> */}
    {/* <div className="mb-3 d-flex gap-2">
      
      <input
        type="text"
        placeholder="Rechercher par nom ou téléphone"
        className="form-control"
        value={searchNomTel}
        onChange={(e) => setSearchNomTel(e.target.value)}
      />

      
      <select
        className="form-control"
        value={filterVille}
        onChange={(e) => setFilterVille(e.target.value)}
      >
        <option value="">Toutes les villes</option>
        {villes.map((ville, idx) => (
          <option key={idx} value={ville}>{ville}</option>
        ))}
      </select>

      
      <select
        className="form-control"
        value={filterDegré}
        onChange={(e) => setFilterDegré(e.target.value)}
      >
        <option value="">Tous les degrés</option>
        {degres.map((deg, idx) => (
          <option key={idx} value={deg}>{deg}</option>
        ))}
      </select>
    </div> */}

  <div className="container mt-5 box-shadow">
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
      <thead className="head-table">
        <tr>
          <th></th>
          <th className="ps-3">Nom</th>
          
          {/* <th>Email</th> */}
          <th>Ville</th>
          <th>Téléphone</th>
          <th>Degrer d'interet</th>
          {/* <th>Statut</th> */}
          <th>Commercial affecté</th>
          <th>Bien Proposés</th>
          <th>Bien Associés</th>
          {/* <th className="text-center">
            <button className="btn btn-primary" onClick={() => navigate('../addLead')}>
              <IoAdd />
            </button>
          </th> */}
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {currentRows.map((lead, index) => (
          // <tr key={index} onClick={() => navigate(`../leadInfo/${lead.id}`)}>
          <tr key={index}>
            <td onClick={() => navigate(`../leadInfo/${lead.id}`)}>
              <div className="form-check">
                <input className="form-check-input" type="checkbox"/>
              </div>
            </td>
            <td className="ps-3">{lead.nom + ' '+ lead.prenom}</td>
            
            {/* <td>
              <span className="span-email">{lead.email}</span>
            </td> */}
            <td>{lead.quartiers[0].ville}</td>
            <td>{'0' + lead.telephone}</td>
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
            {/* <td>
              <span className="badge-affecter">{lead.statut}</span>
            </td> */}
            <td>
              {lead.commercial && lead.commercial.nom
                ? lead.commercial.nom + ' ' + lead.commercial.prenom
                : 'Non affecté'}
            </td>
            <td>
            <PropositionsButton lead={lead} onClick={handleProposeBiens} onCancel={() => setShowPropositionModal(false)}/>
            </td>
            <td>
              {associatedBiens[lead.id]?.length > 0 ? (
                <ul>
                  {associatedBiens[lead.id].map((bien, idx) => (
                    <span key={idx} className="bg-dispo ms-2">{bien.reference}</span>
                  ))}
                </ul>
              ) : (
                <span className="bg-non-dispo">Aucun bien associé</span>
              )}
            </td>
            {/* <td>
              <button className="btn btn-warning btn-sm" onClick={() => setUpdateLead(lead)}>
                <FaEdit />
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(lead.id)}>
                <FaTrash />
              </button>
            </td> */}

            {/* <td>
                <ActionMenuLead
                    onEdit={() => setUpdateLead(lead)}
                    onEditStatut={() => setLeadStatut(lead)}
                    onInfo={() => {()=> navigate('../users')}}
                    onDelete={() => handleDelete(bien.id)}
                />
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
  Affichage de {indexOfFirstRow + 1} à {Math.min(indexOfLastRow, filteredData.length)} sur {filteredData.length} leads
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
  <Modal isOpen={showPropositionModal} onClose={() => setShowPropositionModal(false)}>
      <BiensProposes 
                  leadSelected={selectedLead} 
                  onCancel={()=> setShowPropositionModal(false)}
                  onSuccess={()=>{
                    fetchLeads();
                    onRefresh(); // ← Rafraîchir les counts
                  }}
        />
  </Modal>
  



  {updateLead && (
    <UpdateLead
      lead={updateLead}
      setSelectedLead={setUpdateLead}
      show={true}
      handleClose={() => setUpdateLead(null)}
      onSuccess={() => {
        fetchLeads();
        onRefresh(); 
      }}
    />
  )}
  {leadStatut && (
    <UpdateStatut
      lead={leadStatut}
      onClose={() => setLeadStatut(null)}
      onSuccess={() => {
        handleStatusUpdateSuccess();
        fetchLeads();
        onRefresh();
      }}
    />
  )}
</div> 

</>

  );





};

export default Affecté;