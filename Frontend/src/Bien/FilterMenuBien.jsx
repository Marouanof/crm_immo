import React, { useState } from "react";

const FilterMenuBien = ({ 
    types, 
    etats,
    statuts, 
    transactions, 
    chambres, 
    importances, 
    currentFilters, 
    onFilterChange,
    onApply,
    onReset
}) => {
    const [localFilters, setLocalFilters] = useState(currentFilters);

    const handleFilterChange = (name, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleApply = () => {
        onFilterChange(localFilters);
        onApply();
    };

    return (
        <div style={{ width: "300px" }} className="p-3 border rounded bg-light shadow-sm">
            {/* Type de bien */}
            <select
                className="form-control mb-2"
                value={localFilters.type_bien}
                onChange={(e) => handleFilterChange('type_bien', e.target.value)}
            >
                <option value="">Tous les types</option>
                {types.map((type, idx) => (
                    <option key={idx} value={type}>
                        {type}
                    </option>
                ))}
            </select>
            {/* Etat de bien */}
            <select
                className="form-control mb-2"
                value={localFilters.etat_bien}
                onChange={(e) => handleFilterChange('etat_bien', e.target.value)}
            >
                <option value="">Tous les etats</option>
                {etats.map((type, idx) => (
                    <option key={idx} value={type}>
                        {type}
                    </option>
                ))}
            </select>
            {/* Statut */}
            <select
                className="form-control mb-2"
                value={localFilters.statut_commercial}
                onChange={(e) => handleFilterChange('statut_commercial', e.target.value)}
            >
                <option value="">Tous les statuts</option>
                {statuts.map((statut, idx) => (
                    <option key={idx} value={statut}>
                        {statut}
                    </option>
                ))}
            </select>

            {/* Type de transaction */}
            <select
                className="form-control mb-2"
                value={localFilters.type_transaction}
                onChange={(e) => handleFilterChange('type_transaction', e.target.value)}
            >
                <option value="">Toutes les transactions</option>
                {transactions.map((trans, idx) => (
                    <option key={idx} value={trans}>
                        {trans}
                    </option>
                ))}
            </select>

            {/* Nombre de chambres */}
            <select
                className="form-control mb-2"
                value={localFilters.nbr_chambre}
                onChange={(e) => handleFilterChange('nbr_chambre', e.target.value)}
            >
                <option value="">Tous les nombres de chambres</option>
                {chambres.map((chambre, idx) => (
                    <option key={idx} value={chambre}>
                        {chambre}
                    </option>
                ))}
            </select>

            {/* Degré d'importance */}
            <select
                className="form-control mb-2"
                value={localFilters.degre_importance}
                onChange={(e) => handleFilterChange('degre_importance', e.target.value)}
            >
                <option value="">Tous les degrés d'importance</option>
                {importances.map((imp, idx) => (
                    <option key={idx} value={imp}>
                        {imp}
                    </option>
                ))}
            </select>
            <div className="row">
                {/* Ligne 1 */}
                <div className="col-6">
                    <div className="form-check form-switch mb-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="ascenseur"
                        checked={localFilters.ascenseur === true}
                        onChange={(e) => handleFilterChange('ascenseur', e.target.checked || undefined)}
                    />
                    <label className="form-check-label" htmlFor="ascenseur">Ascenseur</label>
                    </div>
                </div>
                <div className="col-6">
                    <div className="form-check form-switch mb-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="jardin"
                        checked={localFilters.jardin === true}
                        onChange={(e) => handleFilterChange('jardin', e.target.checked || undefined)}
                    />
                    <label className="form-check-label" htmlFor="jardin">Jardin</label>
                    </div>
                </div>
                
                {/* Ligne 2 */}
                <div className="col-6">
                    <div className="form-check form-switch mb-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="terrasse"
                        checked={localFilters.terrasse === true}
                        onChange={(e) => handleFilterChange('terrasse', e.target.checked || undefined)}
                    />
                    <label className="form-check-label" htmlFor="terrasse">Terrasse</label>
                    </div>
                </div>
                <div className="col-6">
                    <div className="form-check form-switch mb-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="garage"
                        checked={localFilters.garage === true}
                        onChange={(e) => handleFilterChange('garage', e.target.checked || undefined)}
                    />
                    <label className="form-check-label" htmlFor="garage">Garage</label>
                    </div>
                </div>
            </div>
            {/* Prix min/max */}
            <div className="row mb-2">
                <div className="d-flex">
                    <div className="">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Prix min"
                        style={{
                            width: "130px"
                        }}
                        value={localFilters.prix_min}
                        onChange={(e) => handleFilterChange('prix_min', e.target.value)}
                    />
                </div>
                <div className="">
                    <input
                        type="number"
                         style={{
                            width: "130px"
                        }}
                        className="form-control"
                        placeholder="Prix max"
                        value={localFilters.prix_max}
                        onChange={(e) => handleFilterChange('prix_max', e.target.value)}
                    />
                </div>
                </div>
                <div className="d-flex">
                    <div className="">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Surface min"
                        style={{
                            width: "130px"
                        }}
                        value={localFilters.surface_min}
                        onChange={(e) => handleFilterChange('surface_min', e.target.value)}
                    />
                </div>
                <div className="">
                    <input
                        type="number"
                         style={{
                            width: "130px"
                        }}
                        className="form-control"
                        placeholder="Surface max"
                        value={localFilters.surface_max}
                        onChange={(e) => handleFilterChange('surface_max', e.target.value)}
                    />
                </div>
                </div>
            </div>

            <div className="d-flex gap-2">
                <button className="btn btn-primary" style={{ backgroundColor: "#0d6efd", color: "white" }} onClick={handleApply}>
                    Appliquer
                </button>
                <button className="btn btn-secondary" style={{ backgroundColor: "#eee", color: "#333" }} onClick={onReset}>
                    Annuler
                </button>
            </div>
        </div>
    );
};

export default FilterMenuBien;