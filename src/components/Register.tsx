import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CssBaseline,
  ThemeProvider,
  createTheme,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    username: "",
    clave: "",
    repetirClave: "",
    departamentoId: "",
    cargoId: "",
  });

  const [departamentos, setDepartamentos] = useState([]);
  const [cargos, setCargos] = useState([]);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  const [showRepeatPassword, setShowRepeatPassword] = useState(false); // Estado para repetir contraseña

  // Fetch para obtener departamentos
  useEffect(() => {
    fetch("http://localhost:8080/departamentos")
      .then((response) => response.json())
      .then((data) => setDepartamentos(data))
      .catch((error) => console.error("Error al obtener departamentos:", error));
  }, []);

  // Fetch para obtener cargos
  useEffect(() => {
    fetch("http://localhost:8080/cargos")
      .then((response) => response.json())
      .then((data) => setCargos(data))
      .catch((error) => console.error("Error al obtener cargos:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Limpia errores del campo actualizado
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const validationErrors = {};
    if (!formData.username) validationErrors.username = "El nombre de usuario es obligatorio.";
    if (!formData.email) validationErrors.email = "El correo electrónico es obligatorio.";
    if (!formData.clave) validationErrors.clave = "La contraseña es obligatoria.";
    if (formData.clave !== formData.repetirClave)
      validationErrors.repetirClave = "Las contraseñas no coinciden.";
    if (!formData.apellido) validationErrors.apellido = "El apellido es obligatorio.";
    if (!formData.nombre) validationErrors.nombre = "El nombre es obligatorio.";
    if (!formData.cargoId) validationErrors.cargoId = "El cargo es obligatorio.";
    if (!formData.departamentoId) validationErrors.departamentoId = "El departamento es obligatorio.";
  
    setErrors(validationErrors);
  
    if (Object.keys(validationErrors).length === 0) {
      try {
        const dataToSend = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          username: formData.username,
          clave: formData.clave,
          email: formData.email,
          departamento_id: parseInt(formData.departamentoId), // Convierte a número si es necesario
          cargo_id: parseInt(formData.cargoId), // Convierte a número si es necesario
        };
  
        const response = await fetch("http://localhost:8080/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          alert(`Error: ${errorData.message || "Hubo un problema con el registro."}`);
        } else {
          alert("Registro exitoso. ¡Bienvenido!");
          setFormData({
            nombre: "",
            apellido: "",
            email: "",
            username: "",
            clave: "",
            repetirClave: "",
            departamentoId: "",
            cargoId: "",
          });
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar al servidor. Inténtalo más tarde.");
      }
    }
  };
  
  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Registro de Usuario
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Nombre y Apellido */}
            <Grid item xs={6}>
              <TextField
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                fullWidth
                error={!!errors.nombre}
                helperText={errors.nombre}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                fullWidth
                error={!!errors.apellido}
                helperText={errors.apellido}
              />
            </Grid>

            {/* Correo Electrónico */}
            <Grid item xs={12}>
              <TextField
                label="Correo Electrónico"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                error={!!errors.email}
                helperText={errors.email}
              />
            </Grid>

            {/* Nombre de Usuario */}
            <Grid item xs={12}>
              <TextField
                label="Nombre de Usuario"
                name="username"
                value={formData.username}
                onChange={handleChange}
                fullWidth
                error={!!errors.username}
                helperText={errors.username}
              />
            </Grid>

            {/* Contraseña y Repetir Contraseña */}
            <Grid item xs={6}>
              <TextField
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                name="clave"
                value={formData.clave}
                onChange={handleChange}
                fullWidth
                error={!!errors.clave}
                helperText={errors.clave}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Repetir Contraseña"
                type={showRepeatPassword ? "text" : "password"}
                name="repetirClave"
                value={formData.repetirClave}
                onChange={handleChange}
                fullWidth
                error={!!errors.repetirClave}
                helperText={errors.repetirClave}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                        edge="end"
                      >
                        {showRepeatPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Departamento y Cargo */}
            <Grid item xs={6}>
              <FormControl fullWidth error={!!errors.departamentoId}>
                <InputLabel>Departamento</InputLabel>
                <Select
                  name="departamentoId"
                  value={formData.departamentoId}
                  onChange={handleChange}
                >
                  {departamentos.map((departamento) => (
                    <MenuItem key={departamento.id} value={departamento.id}>
                      {departamento.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth error={!!errors.cargoId}>
                <InputLabel>Cargo</InputLabel>
                <Select
                  name="cargoId"
                  value={formData.cargoId}
                  onChange={handleChange}
                >
                  {cargos.map((cargo) => (
                    <MenuItem key={cargo.id} value={cargo.id}>
                      {cargo.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Botón de Registro */}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
            Registrarse
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Register;





