import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Obtén el token almacenado.

  if (!token) {
    return <Navigate to="/" state={{ message: "Por favor, inicia sesión para acceder a esta página" }} />;
  }

  return children;
};

export default ProtectedRoute;


