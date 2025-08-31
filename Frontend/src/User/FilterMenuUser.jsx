import React, { useState } from "react";

const FilterMenuUser = ({ villes, roles,  onFilterChange, onReset, onClose }) => {
  const [ville, setVille] = useState("");
  const [role, setRole] = useState("");


  const handleApply = () => {
    onFilterChange({ 
      ville,
      role,
    });
    if (onClose) onClose();
  };

  const handleReset = () => {
    setVille("");
    setRole("");
    
    onFilterChange({ 
      ville: "", 
      role: "",
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

      {/* Role */}
      <select className="form-control mb-2" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">Tous les roles</option>
        {roles.map((q, idx) => <option key={idx} value={q}>{q}</option>)}
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

export default FilterMenuUser;
