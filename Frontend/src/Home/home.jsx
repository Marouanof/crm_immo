import React from "react";
import { Link} from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Login from '../Home/home'

const Home = () => {
    const navigate = useNavigate();
    return (
        <>
          <h1>Home:</h1>
          <Link to="/login">LOGIN</Link>
        </>
    );
};

export default Home;