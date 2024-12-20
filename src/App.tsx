import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login"; // Tu componente de Login
import Register from "./components/Register"; // Tu componente de Register
import Dashboard from "./components/DashboardLayoutAccountSidebar"; // Tu componente de Dashboard
import ProtectedRoute from "./components/ProtectedRoute";

const App: React.FC = () => { //
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> {/* Ruta inicial */}
        <Route path="/register" element={<Register />} /> {/* Registro */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> {/* Dashboard */}
      </Routes>
    </Router>
  );
};

export default App;

