import {React, useState , useEffect, useCallback}from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Partie/navbar";
// import UpdateLead from "./UpdateLead";
// import UpdateStatut from "./UpdateStatut";
import PropositionsButton from '../Lead/PropositionsButton';

const LeadsCommercial = () =>{
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [data, setData] = useState([]);
    const [dataNouveau, setDataNouveau] = useState([]);
    const [dataPerdu, setDataPerdu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [leadEdit, setLeadEdit] = useState(null);
    const [lead, setLead] = useState([]);
    const [leadStatut,setLeadStatut] = useState(null);
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [villeFilter, setVilleFilter] = useState("");
    const [sourceFilter, setSourceFilter] = useState("");
    // const data_filter = [];

    const fetchLeads = useCallback (async ()=>{
      try{
        const token = localStorage.getItem('access_token');
        const id_commercial = localStorage.getItem('id_commercial');
        const res = await axios.get(`${apiUrl}/lead/leadCommercial/${id_commercial}/`,{
          headers: {
            'Content-Type': "application/json",
            Authorization: `Bearer ${token}` 
          },
        });
        const allData = res.data;
        setData(allData.filter(b => b.statut !== "Nouveau" && b.statut !== "Perdu"));
        setDataNouveau(allData.filter(b => b.statut === 'Nouveau'));
        setDataPerdu(allData.filter(b => b.statut === 'Perdu'));
        setLead(allData);
      }
      catch(error){
         console.error("Erreur:", error);
      }
      finally{
        setLoading(false);
      }
    },[]);

    const villes = Array.from(new Set(data.map(lead => lead.quartiers[0].ville))).filter(Boolean);
    const sources = Array.from(new Set(data.map(lead => lead.source))).filter(Boolean);
    const filteredData = data.filter(lead =>
      (
        lead.nom.toLowerCase().includes(search.toLowerCase()) ||
        lead.prenom.toLowerCase().includes(search.toLowerCase()) ||
        lead.email.toLowerCase().includes(search.toLowerCase())
        // lead.telephone.includes(search)
      ) &&
      (villeFilter === "" || lead.quartiers[0]?.ville === villeFilter)&&
      (sourceFilter === "" || lead.source === sourceFilter)
    );


    useEffect(() => {
      fetchLeads();
        
    }, []);

    if(loading) return <div className="text-center mt-5"> Chargement ...</div>;

    
    // const handleStatusUpdateSuccess = useCallback(() => {
    //     fetchLeads(); // Rafraîchit toutes les données
    // }, [fetchLeads]);

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
        navigate('/biens-proposes', { state: lead  });
    };

    // useEffect(() => {
    //    fetchLeads();
    // }, [fetchLeads]);
    // if(loading) return <div className="text-center mt-5"> Chargement ...</div>;

    return (
    <>
    <Navbar />

    <div className="container mt-5" >
      <h2 className="mb-4 text-center">Liste des Leads</h2>
      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Rechercher par nom, prénom, email ou téléphone"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={villeFilter}
            onChange={e => setVilleFilter(e.target.value)}
          >
            <option value="">Toutes les villes</option>
            {villes.map((ville, idx) => (
              <option key={idx} value={ville}>{ville}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select
            className="form-select"
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
          >
            <option value="">Toutes les sources</option>
            {sources.map((source, idx) => (
              <option key={idx} value={source}>{source}</option>
            ))}
          </select>
        </div>
      </div>
        {/* <button className="btn btn-warning ms-2" {/* onClick={() => navigate('/lead_nouveau', { state: {dataNouveau}})}> 
            <i className="bi bi-exclamation-triangle me-1"></i>Nouveau Lead ({dataNouveau.length})
        </button> */}
        <button className="btn btn-dark">Voir les Leads Perdus ({dataPerdu.length})</button>
      <div className="table-responsive">
        <table className="table table-striped table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Ville</th>
              <th>Téléphone</th>
              <th>Source</th>
              <th>Statut</th>
              {/* <th>Commercial affecter</th> */}
              <th>Bien Proposés</th>
              <th colSpan={2} className="text-center"> <button className="btn btn-primary" onClick={ () => { navigate('../addLead')}}>Ajouter un Lead</button> </th>
              
            </tr>
          </thead>
          <tbody>
            {filteredData.map((lead, index) => (
              <tr key={index}>
                <td>{lead.nom}</td>
                <td>{lead.prenom}</td>
                <td>{lead.email}</td>
                <td>{lead.quartiers[0].ville}</td>  
                <td>{lead.telephone}</td>
                <td>
                  <span className={`badge bg-${lead.source === 'Web' ? 'danger' : 'secondary'}`}>
                    {lead.source}
                  </span>
                </td>
                <td onClick={()=>{setLeadStatut(lead)}}>{lead.statut}</td>
                {/* <td>{lead.commercial && lead.commercial.nom ? lead.commercial.nom + ' ' + lead.commercial.prenom : "Non affecté"}</td> */}
                <PropositionsButton lead={lead} onClick={handleProposeBiens} />
                <td><button className="btn btn-warning btn-sm" onClick={() => handleEdit(lead.id)}> modifier</button></td>
                <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(lead.id)}> supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>

      {/* {leadEdit && (
        <UpdateLead leadId={leadEdit} setSelectedLead={setLeadEdit} onSuccess={Resset} />
      )}
      {leadStatut && (
        <UpdateStatut lead={leadStatut} onClose={() => setLeadStatut(null)} onSuccess={() => {
          handleStatusUpdateSuccess();
        }}
          />
      )} */}
          </div>
          </div>
    </>
  );





};

export default LeadsCommercial;