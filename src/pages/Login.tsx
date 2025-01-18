import React, { useState, useEffect } from "react"; // Importa React, useState, y useEffect.
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Link,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom"; // Hook para manejar la navegación y obtener el state de la redirección.

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#fafafa",
    },
    primary: {
      main: "#1976d2",
    },
  },
});

const Login = () => {
  const navigate = useNavigate(); // Inicializamos el hook para manejar la navegación.
  const location = useLocation(); // Usamos el hook useLocation para obtener el state que pasó en la redirección.
  const [form, setForm] = useState({ username: "", password: "" }); // Estado para manejar los datos del formulario.
  const [errors, setErrors] = useState({ username: false, password: false }); // Estado para manejar los errores de validación.
  const [errorMessage, setErrorMessage] = useState(""); // Estado para manejar mensajes de error global.
  const [redirectMessage, setRedirectMessage] = useState(""); // Nuevo estado para el mensaje de redirección.

  // Leer el mensaje de redirección si existe
  useEffect(() => {
    if (location.state && location.state.message) {
      setRedirectMessage(location.state.message); // Si hay un mensaje en el state, lo guardamos.
    }
  }, [location.state]);

  // Función para manejar los cambios en los campos de texto.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: false });
    setErrorMessage(""); // Limpia mensajes de error generales.
  };

  // Función para manejar el envío del formulario.
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página se recargue.
    const newErrors = {
      username: form.username.trim() === "",
      password: form.password.trim() === "",
    };
    setErrors(newErrors);

    if (!newErrors.username && !newErrors.password) {
      try {
        const response = await fetch("http://localhost:8080/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            clave: form.password, // Cambiado a 'clave' para cumplir con el backend.
          }),
        });

        if (!response.ok) {
          throw new Error("Credenciales inválidas");
        }

        const data = await response.json();
        localStorage.setItem("token", data.token); // Almacena el token JWT.
        navigate("/dashboard"); // Redirige al dashboard.
      } catch (error) {
        setErrorMessage(error.message || "Ocurrió un error. Inténtalo nuevamente.");
      }
    }
  };

  // Función para manejar el clic en el botón "Registrarme".
  const handleRegisterClick = () => {
    navigate("/register");
  };

  // Función para manejar el clic en "¿Olvidaste tu contraseña?"
  const handleForgotPasswordClick = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="login-register-container">
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="xs"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Grupo 8
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Bienvenido, por favor inicia sesión para continuar.
        </Typography>

        {redirectMessage && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {redirectMessage} {/* Muestra el mensaje de redirección si está presente */}
          </Typography>
        )}

        {errorMessage && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", mt: 3 }}>
          <TextField
            label="Nombre de usuario"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={errors.username}
            helperText={errors.username && "Este campo es obligatorio."}
          />

          <TextField
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={errors.password}
            helperText={errors.password && "Este campo es obligatorio."}
          />

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Iniciar Sesión
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 2 }}
            onClick={handleRegisterClick}
          >
            Registrarme
          </Button>

          <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
            <Link href="#" underline="hover" onClick={handleForgotPasswordClick}>
              ¿Olvidaste tu contraseña?
            </Link>
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
    </div>
  );
};

export default Login;
