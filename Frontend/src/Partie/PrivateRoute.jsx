import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({children}) => {
    const token = localStorage.getItem('access_token');
    const authTime = localStorage.getItem('auth_time');

    if(!token || !authTime || (Date.now() - Number(authTime)) > 24 * 60 * 60 * 1000){
        localStorage.removeItem("access_token");
        localStorage.removeItem("auth_time");
        return <Navigate to="/login" replace />
    }
    return children;
};

export default PrivateRoute;