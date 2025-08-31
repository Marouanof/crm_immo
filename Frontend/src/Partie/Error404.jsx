import React from 'react';
import { Button } from '@mui/material';
import { Link as Nav } from 'react-router-dom';
import logo from '../assets/logo/elegant-logo.png';
import error404 from '../assets/404/404.jpg';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Error404.css';

const Error404 = () => {
    const navigate = useNavigate();
  return (
    <div className="error404-container">
      <div className="error404-header">
        <img src={logo} alt="Elegant Logo" />
      </div>
      
      <div className="error404-content">
        <h1 className="error404-title">
          Sorry, page not found!
        </h1>
        <p className="error404-subtitle">
          Désolé, nous n'avons pas trouvé la page que vous cherchiez. 
          Vous avez peut-être fait une erreur dans l' URL ? Vérifiez l'orthographe.
        </p>
        <img
          src={error404}
          alt="Error 404"
          className="error404-image"
        />
        <button 
        //   component={Nav} 
        //   to="/" 
        onClick={()=> navigate(-1)}
          className="error404-button"
        >
          Retour
        </button>
      </div>
    </div>
  );
};

export default Error404;