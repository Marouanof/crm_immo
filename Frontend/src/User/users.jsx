import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState, useRef } from 'react';
import UpdateUser from './UpdateUser';
import axios from "axios";
import Navbar from '../Partie/navbar';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/users.css';
import '../assets/styles/lead.css';
import { FaFont,  FaTrash, FaEdit, FaChevronRight , FaPhone, FaEnvelope, FaBriefcase, FaPaperclip, FaLandmark } from "react-icons/fa";
import { IoAdd, IoFilter, IoText } from "react-icons/io5";
import { MdOutlineMail } from "react-icons/md";
import { BsTelephone  } from "react-icons/bs";
// import ActionMenuLead from "./ActionMenuLead";
import ActionMenuLead from '../Lead/ActionMenuLead';
// import FilterMenu from "./FilterMenu";
// import FilterMenu from '../Lead/FilterMenu';
import FilterMenuUser from './FilterMenuUser';
import NavbarUser from './NavbarUser';
import Register from "./Register";
import Modal from '../Lead/Modal';
import NavbarLead from '../Lead/NavbarLead';



export default function AfficherUtilisateurs() {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEdit, setUserEdit] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ 
      ville: "", 
      degre: "",
      quartier: "",
      statut: "",
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
  

  
    const fetchUser = () =>{
      const token = localStorage.getItem("access_token");
      fetch(`${apiUrl}/utilisateur/users/`, {
        method: "GET",
        headers: {
          'Content-Type': "application/json",
          Authorization: `Bearer ${token}` 
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Erreur lors du chargement des utilisateurs");
          }
          return res.json();
        })
        .then((data) => {
          setUtilisateurs(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Erreur:", error);
          setLoading(false);
        });
    }
    useEffect( ()=>{
      fetchUser();
    }, [fetchUser]);

  if (loading) return <div className="text-center mt-5">Chargement...</div>;

  const handleEdit = (id) =>{
    setUserEdit(id);
  }
  const handleDelete = (id) => {
    if(window.confirm("Voulez-vous vraiment supprimer cet utilisateur?")){
      axios
      .delete(`${apiUrl}/utilisateur/supprimer/${id}/`)
      .then(() => {
        alert('utilisateur est supprimer avec succèes');
        fetchUser();
      })
      .catch((error) =>{
        console.log("erreur lors de la suppression :", error);
        alert('Echec de la suppression');
      });
    }
  }

    const villes = [...new Set(utilisateurs.flatMap(user => user.villes))];
    
    const role = ["admin", "commercial", "assistant"];

    const filteredData = utilisateurs.filter((user) => {
      const search = searchNomTel.toLowerCase();

      const matchSearch = 
          user.nom.toLowerCase().includes(search) ||
          user.prenom.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          ("0" + user.telephone).toLowerCase().includes(search);

      const matchRole = filters.role ? user.role === filters.role : true;
      const matchVille = filters.ville ? user.villes.includes(filters.ville) : true;
      return matchSearch && matchRole && matchVille;
  });


    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  

  return (
    <>
    {/* <Navbar /> */}
    <NavbarLead titre="Utilisateur" />
    <div className="container box-shadow mt-3 ">
      <div className="header-table-lead">
        <h5 className="part1">Liste des utilisateurs</h5>
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
                        right: "0px",          // aligné à droite
                        width: "300px",
                        zIndex: 1000
                }}>
                    <FilterMenuUser
                        villes={villes}
                        roles={role}
                        
                        onFilterChange={(newFilters) => setFilters(newFilters)}
                        onReset={() => setShowFilters(false)} // ← fermer après reset
                        onClose={() => setShowFilters(false)} // ← fermeture externe
                    />
                </div>
            )}
            <button className="btn add-btn" onClick={()=> setShowModal(true)}> <IoAdd style={{fontSize: "20px"}}/> Ajouter Utilisateur</button>
        </div>
        
    </div>
      {/* <h2 className="mb-4 ms-2">Liste des utilisateurs</h2> */}
      <div className="table-responsive rounded-3 tableau">
        <table className="table  table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th></th>
              <th className="ps-3">Nom</th>
              {/* <th>Prénom</th> */}
              <th style={{ width: "300px"}}> Email</th>
              <th >Téléphone</th>
              <th >Rôle</th>
              <th >Ville</th>
              <th colSpan={2} className="text-center"> Action</th>
              
            </tr>
          </thead>
          <tbody>
            {currentRows.map((user, index) => (
              <tr key={index}>
                <td>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox"/>
                  </div>
                </td>
                <td className="ps-3">{user.nom +' ' + user.prenom}</td>
                {/* <td>{user.prenom}</td> */}
                <td style={{ width: "230px"}}> <span className="span-email"><FaPaperclip/>{user.email}</span></td>
                <td >{'0' + user.telephone}</td>
                <td >
                  <span className={`badge bg-${user.role === 'admin' ? 'danger' : 'secondary'}`}>
                    {user.role}
                  </span>
                </td>
                {/* <td>{user.villes.flatMap(v => v).join(', ')}</td> */}
                {/* <td>{user.villes.flatMap(v => v).join(', ')}</td> */}
                <td >{(user.villes.length > 1) ? user.villes[0] + '...' : user.villes[0]}</td>
                <td colSpan={2} className="text-center">
                  <button 
                      className="btn btn-warning btn-sm me-3" 
                      onClick={() => {
                        handleEdit(user.id);
                        setShowModalUpdate(true);
                      } 
                      
                  }> <FaEdit /> </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}><FaTrash /> </button>
                </td>
                {/* <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}><FaTrash /> </button></td> */}
              </tr>
            ))}
          </tbody>
        </table>

         {/* Le formulaire apparaît si un utilisateur est sélectionné */}
      {/* {userEdit && (
        <UpdateUser userId={userEdit} setSelectedUser={setUserEdit} />
      )} */}
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

  <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
    <Register 
          onCancel={()=> setShowModal(false)}
          onSuccess={fetchUser}
    />
  </Modal>

  <Modal isOpen={showModalUpdate} onClose={() => setShowModalUpdate(false)}>
    <UpdateUser 
            userId={userEdit} 
            setSelectedUser={setUserEdit} 
            onCancel={()=> setShowModalUpdate(false)}
            onSuccess={fetchUser}
          />
  </Modal>
    </div>
    </>
  );
}
