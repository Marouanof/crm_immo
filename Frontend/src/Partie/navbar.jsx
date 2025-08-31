import React from "react";
import { Link} from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const navigate = useNavigate();
    const logout = () => {
        localStorage.removeItem('access_token');
        // Optionnel : redirection vers la page login
         navigate('../login');
    };
    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                <Link className="navbar-brand" to="#">Navbar</Link>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item active">
                            <Link className="nav-link" to="#">Home </Link>
                        </li>
                        {/* <li className="nav-item">
                            <Link className="nav-link" to="/users">Utilisateur</Link>
                        </li> */}
                        <li className="nav-item active">
                            <Link className="nav-link" to="/biens">Bien </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/commercial/lead">Lead</Link>
                        </li>
                        
                    </ul>
                    <div className="d-flex ms-auto me-5">
                        <button className="btn btn-success my-2 my-sm-0" onClick={logout}>Logout</button>
                    </div>
                    
                </div>
            </nav>
        </>
    );
};

export default Navbar;

