import React, { useState, useEffect } from "react";
import axios from "axios";
import Opportunité from "./Opportunité";
import NonRelance from "./NonRelance";
import Affecté from "./Affecté";
import NewLead from "./NewLead";
import RDVPlanifie from "./RDVPlanifie";
import LeadsARappeler from "./LeadsARappeler";
import Gagne from "./Gagne";
import LeadPerdu from "./LeadPerdu";
import AllLead from "./AllLead";
import NavbarLead from "./NavbarLead";
import "../assets/styles/statutLead.css";

const LeadList = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [activeComponent, setActiveComponent] = useState("All");
  const [search, setSearch] = useState("");
  const [villeFilter, setVilleFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [lead, setLead] = useState([]);
  const [data, setData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem("role");
  const id_user = localStorage.getItem("id_user");

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1); // incrémente pour forcer re-render
  };


  const [counts, setCounts] = useState({
    nouveau: 0,
    affecté: 0,
    rdv: 0,
    rappeler: 0,
    nonRelance: 0,
    opportunité: 0,
    gagné: 0,
    perdu: 0,
  });
  const [loading, setLoading] = useState(true);

  const statusColors = {
    All: "btn-status-primary",
    Affecté: "btn-status-primary",
    Nouveau: "btn-status-warning",
    RDV: "btn-status-info",
    Rappeler: "btn-status-secondary",
    NonRelance: "btn-status-dark",
    Opportunité: "btn-status-success",
    Perdu: "btn-status-danger",
    Gagné: "btn-status-success",
  };

  useEffect(() => {
      const token = localStorage.getItem("access_token");
      const res = axios.get(`${apiUrl}/lead/leads`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => setData(res.data))
      .catch(error => console.error(error));
      
      fetchCounts();
  }, [refreshKey]);

  const fetchCounts = async () => {
    try {
      if(role === "commercial"){
        const res = await axios.get(`${apiUrl}/lead/statsCommercial/${id_user}/`,{
            headers: {
              'Content-Type': "application/json",
              Authorization: `Bearer ${token}` 
            },
          });
          console.log(res.data);
    
        setCounts({
          all: (res.data["Nouveau"] +  res.data["Affecté"] + res.data["RDV planifié"] + res.data["A rappeler"] + res.data["Non relancé"] + res.data["Opportunité"] + res.data["Gagné"] + res.data["Perdu"])|| 0,
          nouveau: res.data["Nouveau"] || 0,
          affecté: res.data["Affecté"] || 0,
          rdv: res.data["RDV planifié"] || 0,
          rappeler: res.data["A rappeler"] || 0,
          nonRelance: res.data["Non relancé"] || 0,
          opportunité: res.data["Opportunité"] || 0,
          gagné: res.data["Gagné"] || 0,
          perdu: res.data["Perdu"] || 0
        });
      }
      else{
        const res = await axios.get(`${apiUrl}/lead/stats/`);
        setCounts({
          all: (res.data["Nouveau"] +  res.data["Affecté"] + res.data["RDV planifié"] + res.data["A rappeler"] + res.data["Non relancé"] + res.data["Opportunité"] + res.data["Gagné"] + res.data["Perdu"])|| 0,
          nouveau: res.data["Nouveau"] || 0,
          affecté: res.data["Affecté"] || 0,
          rdv: res.data["RDV planifié"] || 0,
          rappeler: res.data["A rappeler"] || 0,
          nonRelance: res.data["Non relancé"] || 0,
          opportunité: res.data["Opportunité"] || 0,
          gagné: res.data["Gagné"] || 0,
          perdu: res.data["Perdu"] || 0
        });
      }
      
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }; 
  useEffect(() => {
    fetchCounts();
  }, [refreshKey]);

  const renderActiveComponent = () => {
    switch (activeComponent) {
      case 'All':
        return <AllLead onRefresh={handleRefresh}/>;
      case "Nouveau":
        return <NewLead onRefresh={handleRefresh}/>;
      case "Affecté":
        return <Affecté onRefresh={handleRefresh}/>;
      case "RDV":
        return <RDVPlanifie onRefresh={handleRefresh}/>;
      case "Rappeler":
        return <LeadsARappeler onRefresh={handleRefresh}/>;
      case "NonRelance":
        return <NonRelance onRefresh={handleRefresh}/>;
      case "Opportunité":
        return <Opportunité onRefresh={handleRefresh}/>;
      case "Gagné":
        return <Gagne onRefresh={handleRefresh}/>;
      case "Perdu":
        return <LeadPerdu onRefresh={handleRefresh}/>;
      default:
        return <AllLead onRefresh={handleRefresh}/>;
    }
  };

  if (loading) return <div className="text-center mt-5">Chargement...</div>;

  const tabs = [
    { label: "All", key: "All", count: counts.all },
    { label: "Affecté", key: "Affecté", count: counts.affecté },
    { label: "Non Affecté", key: "Nouveau", count: counts.nouveau },
    { label: "RDV Planifié", key: "RDV", count: counts.rdv },
    { label: "À rappeler", key: "Rappeler", count: counts.rappeler },
    { label: "Non Relancé", key: "NonRelance", count: counts.nonRelance },
    { label: "Opportunité", key: "Opportunité", count: counts.opportunité },
    { label: "Perdu", key: "Perdu", count: counts.perdu },
    { label: "Gagné", key: "Gagné", count: counts.gagné },
  ];

  return (
    <>
    
    <div className="container">
      <NavbarLead 
        titre="Leads"
        onRefresh={handleRefresh}
      />
      {/* <div className="row mb-3">
        <h2>Liste des leads</h2>
        
    </div> */}
      <div className="mt-4">
        <ul className="nav nav-pills flex-wrap gap-2 justify-content-center">
          {tabs.map((tab) => (
            <li className="nav-item" key={tab.key}>
              <button
                className={`btn ${
            activeComponent === tab.key
              ? `${statusColors[tab.key]}` // couleur du statut si actif
              : "btn-non-active" // couleur neutre si inactif
          }`}
                onClick={() => setActiveComponent(tab.key)}
              >
                {tab.label}{" "}
                <span className="badge bg-light text-dark">
                  {tab.count}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* <hr /> */}

        <div className="mt-4">{renderActiveComponent()}</div>
      </div>
    </div>
    </>
  );
};

export default LeadList;
