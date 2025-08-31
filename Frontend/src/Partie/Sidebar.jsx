import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronDown, FaGlobe, FaHome, FaUser, FaBuilding, FaUserPlus, FaSignOutAlt, FaBars } from "react-icons/fa";
import { Box } from "@mui/material";
import logo from '../assets/logo/elegant-logo.png';
import '../assets/styles/sidebar.css';
import { Outlet } from "react-router-dom";
import NotificationButton from "../Notifications/NotificationButton";

const Sidebar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="app-container ">
      {/* Bouton menu burger */}
      <button className="burger-btn" onClick={() => setOpen(!open)}>
        <FaBars />
      </button>
      {/* Sidebar */}
      <div
        className={`bg-sidebar sidebar p-4 shadow-lg rounded-5 m-3  ${open ? "open" : ""}`}
        style={{ width: '240px', transition: 'width 0.3s ease' , color: 'rgb(111, 117, 126)'}}
      >
        {/* {open && <div className="overlay" onClick={() => setOpen(false)}></div>} */}
        {/* Logo */}
        <div className="d-flex justify-content-center mb-4">
          <Link to="/" className="text-decoration-none">
            <img src={logo} alt="logo" width={120} className="img-fluid" />
          </Link>
        </div>

        {/* Navigation */}
        <ul className="nav flex-column" style={{ color: 'rgb(111,117,126)'}}>
          <li className="nav-item mb-2" id="home">
            <Link
              to="/"
              className="nav-link text-white d-flex align-items-center rounded py-2 px-3 hover-bg-primary"
              style={{ height: "50px"}}
            >
              <FaHome className="me-3 fs-5" /> Home
            </Link>
          </li>
          <li className="nav-item mb-2">
            <a
              href="https://immofacile.ma/"
              className="nav-link link-color d-flex align-items-center rounded py-2 px-3 hover-bg-primary"
              style={{ height: "50px"}}
            >
              <FaGlobe className="me-3 fs-5" /> Immofacile
            </a>
          </li>
          {/* Si admin → affiche Utilisateur */}
          {role === "admin" && (
            <li className="nav-item mb-2">
              <Link
                to="/users"
                className="nav-link link-color d-flex align-items-center rounded py-2 px-3 hover-bg-primary"
                style={{ height: "50px" }}
              >
                <FaUser className="me-3 fs-5" /> Utilisateur
              </Link>
            </li>
          )}
          {/* <li className="nav-item mb-2">
            <Link
              to="/users"
              className="nav-link link-color d-flex align-items-center rounded py-2 px-3 hover-bg-primary"
              style={{ height: "50px"}}
            >
              <FaUser className="me-3 fs-5" /> Utilisateur
            </Link>
          </li> */}
          <li className="nav-item mb-2">
            <Link
              to="/biens"
              className="nav-link link-color d-flex align-items-center rounded py-2 px-3 hover-bg-primary"
              style={{ height: "50px"}}
            >
              <FaBuilding className="me-3 fs-5"  /> Biens
            </Link>
          </li>
          <li className="nav-item mb-2">
            <Link
              to="/leads"
              className="nav-link link-color d-flex align-items-center rounded py-2 px-3 hover-bg-primary"
              style={{ height: "50px"}}
            >
              <FaUserPlus className="me-3 fs-5" /> Leads
            </Link>
          </li>
          {/* <li className="nav-item mb-2">
            <NotificationButton />
          </li> */}

        </ul>
        <div className="logout-btn-container">
            <button onClick={logout} className="w-75 btn btn-bg">
                <FaSignOutAlt className="me-2" /> Logout
            </button>
          </div>
      </div>

      {/* Main Content */}
      <div className="partie2 p-3">
        {/* Outlet or main content */}
        <Outlet />
      </div>
    </div>
  );
};

export default Sidebar;
