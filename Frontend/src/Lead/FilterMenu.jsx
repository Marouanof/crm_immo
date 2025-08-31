import React, { useState } from "react";

const FilterMenu = ({ villes, degres, quartiers, statuts, etatBiens,  typesTransaction, chambres, onFilterChange, onReset, onClose }) => {
  const [ville, setVille] = useState("");
  const [degre, setDegre] = useState("");
  const [quartier, setQuartier] = useState("");
  const [statut, setStatut] = useState("");
  const [etatBien, setEtatBien] = useState("");
  const [typeTransaction, setTypeTransaction] = useState("");
  const [nbrChambre, setNbrChambre] = useState("");


  const handleApply = () => {
    onFilterChange({ 
      ville,
      degre,
      quartier,
      statut,
      etat_bien: etatBien,
      type_transaction: typeTransaction,
      nbr_chambre: nbrChambre
    });
    if (onClose) onClose();
  };

  const handleReset = () => {
    setVille("");
    setDegre("");
    setQuartier("");
    setStatut("");
    setEtatBien("");
    setTypeTransaction("");
    setNbrChambre("");
    onFilterChange({ 
      ville: "", 
      degre: "",
      quartier: "",
      statut: "",
      etat_bien: "",
      type_transaction: "",
      nbr_chambre: ""
    });
    if (onReset) onReset();
  };

  return (
    <div style={{ width: "300px" }} className="p-3 border rounded bg-light shadow-sm">
      {/* Select villes */}
      <select
        className="form-control mb-2"
        value={ville}
        onChange={(e) => setVille(e.target.value)}
      >
        <option value="">Toutes les villes</option>
        {villes.map((v, idx) => (
          <option key={idx} value={v}>
            {v}
          </option>
        ))}
      </select>

      {/* Quartier */}
      <select className="form-control mb-2" value={quartier} onChange={(e) => setQuartier(e.target.value)}>
        <option value="">Tous les quartiers</option>
        {quartiers.map((q, idx) => <option key={idx} value={q}>{q}</option>)}
      </select>

      {/* Select degré d'intérêt */}
      <select
        className="form-control mb-2"
        value={degre}
        onChange={(e) => setDegre(e.target.value)}
      >
        <option value="">Tous les degrés</option>
        {degres.map((d, idx) => (
          <option key={idx} value={d}>
            {d}
          </option>
        ))}
      </select>

      {/* Statut */}
      <select className="form-control mb-2" value={statut} onChange={(e) => setStatut(e.target.value)}>
        <option value="">Tous les statuts</option>
        {statuts.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
      </select>

      {/* Etat bien */}
      <select className="form-control mb-2" value={etatBien} onChange={(e) => setEtatBien(e.target.value)}>
        <option value="">Tous les etat_bien</option>
        {etatBiens.map((s, idx) => <option key={idx} value={s}>{s}</option>)}
      </select>

      {/* Type transaction */}
      <select className="form-control mb-2" value={typeTransaction} onChange={(e) => setTypeTransaction(e.target.value)}>
        <option value="">Tous les types</option>
        {typesTransaction.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
      </select>

      {/* Nombre de chambres */}
      <select className="form-control mb-2" value={nbrChambre} onChange={(e) => setNbrChambre(e.target.value)}>
        <option value="">Toutes les nbr_chambre</option>
        {chambres.map((c, idx) => <option key={idx} value={c}>{c}</option>)}
      </select>

      <div className="d-flex gap-2">
        <button className="btn btn-primary" style={{ backgroundColor: "#fa036b", color: "white" }} onClick={handleApply}>
          Appliquer
        </button>
        <button className="btn btn-secondary" style={{ backgroundColor: "#eee", color: "#333" }} onClick={handleReset}>
          Annuler
        </button>
      </div>
    </div>
  );
};

export default FilterMenu;
