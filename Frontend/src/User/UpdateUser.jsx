import React, { useState, useEffect } from "react";
import axios from "axios";
import ville_data from '../../region_ville.json';
import Select from 'react-select';

function UpdateUser({ userId, setSelectedUser, onCancel, onSuccess }) {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [formData, setFormData] = useState({
    id: userId,
    nom: "",
    prenom: "",
    email: "",
    // password: user.password || '',
    telephone: "",
    role: "",
    // ville: "",
  });

  const [villeChoisie, setVilleChoisie] = useState([]);
  const [villeOptions, setVilleOptions] = useState([]);
  const [villeRecu, setVilleRecu] = useState([]);
  const [regionValue, setRegionValue] = useState('');

  const regionOptions = ville_data.map(r => ({value:r.region , label:r.region}));
  

  const token = localStorage.getItem('access_token');
  



  useEffect(() => {
    if (userId) {
      const user = axios.get(`${apiUrl}/utilisateur/user/${userId}/`,{
          headers: {
            'Content-Type': "application/json",
            Authorization: `Bearer ${token}` 
          },
        });
    user.then((res) => {
          const villeRecu = res.data.villes_user;
          setVilleRecu(villeRecu);

          const regionValue = villeRecu.length > 0 ? ville_data.find(r => r.villes.includes(villeRecu[0])) : "";
          setRegionValue(regionValue);
          if(regionValue){
            const villes = regionValue.villes.map(v => ({value:v, label:v}));
            setVilleOptions(villes);
          }
          setFormData({
            nom : res.data.nom || '',
            prenom: res.data.prenom || '',
            email: res.data.email || '',
            telephone: res.data.telephone || '',
            role: res.data.role || ''
          });
        }).catch((err) => {
          console.error("Erreur détaillée :", err.response?.data);
        });
      
    }
  }, []);

  // // const regionValue = ville_data.find(r => r.villes.includes(villeRecu[0]));
  // const regionValue = villeRecu.length > 0
  //       ? ville_data.find(r => r.villes.includes(villeRecu[0])) : "";
  
  // console.log(regionValue);
  // const regionName =regionValue.region;
  // console.log(regionName);

  // const ville_recu = villeRecu.join(', ');
  // console.log(ville_recu);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const dataTotal = {
      ...formData,
      villeChoisie
    };

    console.log(dataTotal);

    axios.put(`${apiUrl}/utilisateur/modifier/${userId}/`, dataTotal,{
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(() => {
        alert("Utilisateur modifié avec succès");
        setSelectedUser(null); // cacher le formulaire après modif
        onSuccess();
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="modal-overlay ">
      <div className="modal-content bg-white rounded-3">
    <form onSubmit={handleSubmit} className="container">
      <h4>Modifier l'utilisateur</h4>
      <div className="mb-3">
        <input className="form-control" type="text" name="nom" placeholder="Nom" value={formData.nom} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <input className="form-control" type="text" name="prenom" placeholder="Prénom" value={formData.prenom} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <input className="form-control" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
      </div>
      {/* <div className="mb-3">
        <input className="form-control" type="text" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
      </div> */}
      <div className="mb-3">
        <input className="form-control" type="text" name="telephone" placeholder="Téléphone" value={'0' + formData.telephone} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <input className="form-control" type="text" name="role" placeholder="Rôle" value={formData.role} onChange={handleChange} />
      </div>

      <div>
        <label>Région</label>
        <Select 
          name="region"
          options={regionOptions}
          className="basic-multi-select mb-3"
          classNamePrefix="select"
          
          value={regionValue ? {value: regionValue.region , label: regionValue.region} : null}
          onChange={(selectedOptions) => {
            
            const selectedRegion = ville_data.find(r => r.region === selectedOptions.value);
            setRegionValue(selectedRegion);

            // Met à jour les villes de cette région
            const villes = selectedRegion.villes.map(v => ({ value: v, label: v }));
            setVilleOptions(villes);

            // Réinitialise la sélection des villes
            setVilleRecu([]);
            setVilleChoisie([]);
              
          }}
          required
        />
      </div>

      <div>
        <label>Villes</label>
        <Select 
          isMulti
          name="ville"
          options={villeOptions}
          className="basic-multi-select mb-3"
          classNamePrefix="select"
          value={villeOptions.filter(opt => villeRecu.includes(opt.value))}
          onChange={(selectedOptions) => {
            const villeChoisie = selectedOptions.map(elem => elem.value);
            setVilleChoisie(villeChoisie);
            setVilleRecu(villeChoisie);
          }}
        />
      </div>
      {/* <div className="mb-3">
        <input className="form-control" type="text" name="ville" placeholder="Ville" value={formData.ville} onChange={handleChange} />
      </div> */}
      <div>
        <button className="btn" style={{ backgroundColor: "#fa036b", color: "white" }} type="submit">Modifier</button>
        <button className="btn ms-2" style={{ backgroundColor: "#eee", color: "#333" }}  onClick={ onCancel }>Annuler</button>
      </div>
      
    </form>
    </div>
    </div>
  );
}

export default UpdateUser;
