import {React, useState, useEffect} from "react";
import "../assets/styles/navbarLead.css";
import axios from "axios";
import logo from "../assets/logo/profil.jpeg";
import { IoNotificationsOutline } from "react-icons/io5";

const NavbarDashboard = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    const [ lead, setLead] = useState([]);
    useEffect(() => {
      const token = localStorage.getItem("access_token");
      const id_user = localStorage.getItem("id_user")
      const res = axios.get(`${apiUrl}/user/${id_user}/`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => setLead(res.data))
      .catch(error => console.error(error));
      
    }, []);
    return (
        <>
            <div className="d-flex justify-content-between align-items-center navbarLead">
                <h5 className="navbar-titre">Dashboard</h5>
                <div className="navbar-btn d-flex justify-content-end align-items-center">
                    <button className="btn-light btn" style={{fontSize: "20px"}} ><IoNotificationsOutline /></button>
                    <div className="vertical-line"></div>
                    {/* <button className="btn btn-light">Message</button> */}
                    <div className="user">
                        <img src={logo} className=""/>
                        <p>
                            {lead.nom + ' ' + lead.prenom}
                            <br />
                            <span>{lead.role}</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
};

export default NavbarDashboard;