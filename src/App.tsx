import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/DashboardLayoutAccountSidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css"; // Asegúrate de importar tu CSS

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
                                    <Dashboard />
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


