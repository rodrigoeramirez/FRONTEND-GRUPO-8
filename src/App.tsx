import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard/DashboardLayout";
import ProtectedRoute from "./pages/ProtectedRoute";
import "./App.css"; // Asegúrate de importar tu CSS
import { UsuarioProvider } from "./context/UsuarioContext";
import { AuthProvider } from "./context/AuthContext";

const App: React.FC = () => {
  return (
    <div className="container">
      <Router>
        <div className="route-content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AuthProvider>
                    <UsuarioProvider>
                      <Dashboard />
                    </UsuarioProvider>
                  </AuthProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </div>
  );
};

export default App;
