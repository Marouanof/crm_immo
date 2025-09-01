import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ville_data from '../../region_ville.json';
import Select from 'react-select';

const Register = ({ onCancel, onSuccess}) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    role: '',
    // ville: ''
  });

  const [villeChoisie, setVilleChoisie] = useState('');

  const regionOptions = ville_data.map(r => ({label: r.region, value: r.region}));

  // const villeOptions = ville_data.map(v => ({label: v.ville, value: v.ville}));
  const [villeOptions, setVilleOptions] = useState([]);


  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataTotal = {
      ...formData,
      villeChoisie
    };

    const token = localStorage.getItem("access_token");
    try {

      const response = await axios.post(`${apiUrl}/utilisateur/register/`, dataTotal, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
      // console.log(response.data);
      onSuccess();
      alert('Utilisateur enregistré avec succès');
      navigate('../users');

    } catch (error) {
      console.error(error.response.data);
      alert('Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="modal-overlay ">
      <div className="modal-content bg-white rounded-3">
      <form onSubmit={handleSubmit} className="container " style={{ Width: "1000px" }}>
    <h2 className="mb-4 text-center">Inscription</h2>

    <div className="mb-3">
      <label className="form-label">Nom</label>
      <input type="text" name="nom" className="form-control" placeholder="Nom" onChange={handleChange} required />
    </div>

    <div className="mb-3">
      <label className="form-label">Prénom</label>
      <input type="text" name="prenom" className="form-control" placeholder="Prénom" onChange={handleChange} required />
    </div>

    <div className="mb-3">
      <label className="form-label">Email</label>
      <input type="email" name="email" className="form-control" placeholder="Email" onChange={handleChange} required />
    </div>

    <div className="mb-3">
      <label className="form-label">Mot de passe</label>
      <input type="password" name="password" className="form-control" placeholder="Mot de passe" onChange={handleChange} required />
    </div>

    <div className="mb-3">
      <label className="form-label">Téléphone</label>
      <input type="text" name="telephone" className="form-control" placeholder="Téléphone" onChange={handleChange} required />
    </div>

    <div className="mb-3">
      <label className="form-label">Rôle</label>
      {/* <input type="text" name="role" className="form-control" placeholder="admin, assistant, commercial..." onChange={handleChange} required /> */}
      <div className="col">
        <select name="role" className="form-control" onChange={handleChange}>
          <option value=""> --Selectionnez Le rôle--</option>
          <option value="admin">Admin</option>
          <option value="commercial">Commercial</option>
          <option value="assistant">Assistant</option>
        </select>
      </div>
      
    </div>

    {/* <div className="mb-3">
      <label className="form-label">Ville</label>
      <input type="text" name="ville" className="form-control" placeholder="Ville" onChange={handleChange} required />
    </div> */}

    <div className="col">
      <label className="form-label">Région</label>
        <Select
          
          name="region"
          options={regionOptions}
          className="basic-multi-select mb-3"
          classNamePrefix="select"
          placeholder="Sélectionner la Région"
          onChange={(selectedOptions) => {
              const region = selectedOptions.value;
              const villeOptions = ville_data.filter(elem => elem.region === region)
                .flatMap(v => v.villes)
                .map(v => ({value: v, label: v}));
              setVilleOptions(villeOptions);
              // setQuartiers({...quartiers, quartier: selectedValues});
              // setVilleChoisie(selectedValues);
          }}
        />
    </div>

    <div className="col">
      <label className="form-label">Ville</label>
        <Select
          isMulti
          name="ville"
          options={villeOptions}
          className="basic-multi-select mb-3"
          classNamePrefix="select"
          placeholder="Sélectionner la ville du région"
          onChange={(selectedOptions) => {
              const selectedValues = selectedOptions.map(option => option.value);
              // setQuartiers({...quartiers, quartier: selectedValues});
              setVilleChoisie(selectedValues);
          }}
        />
    </div>

    <div className="d-flex mt-3">
      <button type="submit" className="btn me-2" style={{ backgroundColor: "#fa036b", color: "white" }}>S'inscrire</button>
      <button className="btn" style={{ backgroundColor: "#eee", color: "#333" }} onClick={ onCancel }> Annuler</button>
    </div>
  </form>
  </div>
  </div>

  );
};

export default Register;
