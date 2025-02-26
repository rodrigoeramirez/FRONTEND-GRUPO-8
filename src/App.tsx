import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard/DashboardLayout";
import ProtectedRoute from "./pages/ProtectedRoute";
import "./App.css"; // Asegúrate de importar tu CSS
import { UsuarioProvider } from "./context/UsuarioContext";
import { AuthProvider } from "./context/AuthContext";
import { RequerimientoProvider } from "./context/RequerimientoContext";
import { TipoRequerimientoProvider } from "./context/TipoRequerimientoContext";
import { EstadoProvider } from "./context/EstadoContext";

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
                <TipoRequerimientoProvider>
                  <EstadoProvider>
                    <ProtectedRoute>
                      <AuthProvider>
                        <UsuarioProvider>
                          <RequerimientoProvider>
                            <Dashboard />
                          </RequerimientoProvider>
                        </UsuarioProvider>
                      </AuthProvider>
                    </ProtectedRoute>
                  </EstadoProvider>
                </TipoRequerimientoProvider>
              }
            />
          </Routes>
        </div>
      </Router>
    </div>
  );
};

export default App;
    