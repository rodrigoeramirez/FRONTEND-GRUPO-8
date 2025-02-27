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
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

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
  const [usernameAvailable, setUsernameAvailable] = useState(null); // Estado para validar el username
  const [emailAvailable, setEmailAvailable] = useState(null); // Estado para validar que el mail no exista en la BD
  const navigate = useNavigate();

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

  // Fetch para validar el username que se está escribiendo
  const validateUsername = async (username) => {
    if (!username) {
      setUsernameAvailable(null); // Reinicia el estado si no hay texto
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:8080/usuarios/validate-username/${username}`);
if (response.ok) {
  const available = await response.json(); // Debe ser un valor booleano
  setUsernameAvailable(available);
} else {
  setUsernameAvailable(false); // Si la respuesta no es ok, marcar como no disponible
}
    } catch (error) {
      console.error("Error validando el nombre de usuario:", error);
      setUsernameAvailable(false); // Marcar como no disponible en caso de error
    }
  };

  const validateEmail = async (email) => {

    if (!email) {
      setEmailAvailable(null); // Si no hay texxto reinicia el estado
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/usuarios/validate-email/${email}`);

      if (response.ok) {
        const available = await response.json(); // Obtengo el valor booleano de la respuesta
        setEmailAvailable(available); 
      } else {
        setEmailAvailable(false); //Si la respuesta no es ok lo pongo en false
      }
      
    } catch (error) {
      console.error("Error validando el email:", error);
    }

  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" }); // Limpia errores del campo actualizado
  };

  const handleVolverClick = () => {
    navigate("/");
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const validationErrors = {}; // Inicializa un objeto de errores.
    if (!formData.username) validationErrors.username = "El nombre de usuario es obligatorio.";
    if (usernameAvailable === false) validationErrors.username = "El nombre de usuario no está disponible.";
    if (!formData.email) validationErrors.email = "El correo electrónico es obligatorio.";
    if (emailAvailable === false) validationErrors.email = "Este email ya está en uso";
    if (!formData.clave) validationErrors.clave = "La contraseña es obligatoria.";
    if (formData.clave.length < 8) validationErrors.clave = "La contraseña debe tener al menos 8 caracteres."; // Nueva validación
    if (formData.clave !== formData.repetirClave)
      validationErrors.repetirClave = "Las contraseñas no coinciden.";
    if (!formData.apellido) validationErrors.apellido = "El apellido es obligatorio.";
    if (!formData.nombre) validationErrors.nombre = "El nombre es obligatorio.";
    if (!formData.cargoId) validationErrors.cargoId = "El cargo es obligatorio.";
    if (!formData.departamentoId) validationErrors.departamentoId = "El departamento es obligatorio.";
  
    setErrors(validationErrors); // Después de realizar todas las validaciones, este objeto se pasa a la función.
  
    if (Object.keys(validationErrors).length === 0 && usernameAvailable === true && emailAvailable === true) {
      try {
        const dataToSend = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          username: formData.username,
          clave: formData.clave,
          email: formData.email,
          departamento_id: parseInt(formData.departamentoId),
          cargo_id: parseInt(formData.cargoId),
        };
  
        const response = await fetch("http://localhost:8080/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataToSend),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          Swal.fire(`Error: ${errorData.message || "Hubo un problema con el registro."}`, "error");
        } else {
          Swal.fire("Registro exitoso", "Tu cuenta ha sido creada correctamente", "success");
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
          navigate("/"); // Redirige al login
        }
      } catch (error) {
        console.error("Error de conexión:", error);
        Swal.fire("No se pudo conectar al servidor. Inténtalo más tarde.", "error");
      }
    }
  };
  
  

  return (
    <div className="login-register-container">
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
    onChange={(e) => {
      const newEmail = e.target.value;
      setFormData({ ...formData, email: newEmail });
      setErrors({ ...errors, email: "" }); // Limpia el error cuando cambia el campo
    }}
    onBlur={(e) => {
      const email = e.target.value;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          email: "El formato del correo electrónico no es válido.",
        }));
      } else {
        validateEmail(email); // Llama a la validación de la BD si el formato es válido
      }
    }}
    fullWidth
    error={!!errors.email || emailAvailable === false} // Marca como error si el formato o la disponibilidad fallan
    helperText={
      errors.email ||
      (emailAvailable === false ? "El email ya está en uso." : "")
    }
  />
</Grid>


            {/* Nombre de Usuario */}
            <Grid item xs={12}>
  <TextField
    label="Nombre de Usuario"
    name="username"
    value={formData.username}
    onChange={(e) => {
      const newUsername = e.target.value
        .toLowerCase() // Convierte todo a minúscula
        .replace(/\s/g, ""); // Elimina espacios en blanco

      // Expresión regular para permitir solo letras, números y los símbolos _.-
      const validRegex = /^[a-z0-9._-]*$/;

      if (validRegex.test(newUsername)) {
        setFormData({ ...formData, username: newUsername });
        setErrors({ ...errors, username: "" }); // Limpia error si es válido
        validateUsername(newUsername); // Validar disponibilidad en BD
      }
    }}
    onBlur={(e) => {
      const username = e.target.value;
      if (username.length < 4 || username.length > 20) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          username: "El nombre de usuario debe tener entre 4 y 20 caracteres.",
        }));
      }
    }}
    fullWidth
    error={!!errors.username || usernameAvailable === false}
    helperText={
      errors.username ||
      (usernameAvailable === false
        ? "El nombre de usuario ya está en uso."
        : "Debe estar en minúsculas, sin espacios y solo puede contener letras, números, guiones (-), puntos (.) y guiones bajos (_).")
    }
    sx={{
      "& .MuiOutlinedInput-root": {
        borderColor:
          usernameAvailable === null
            ? ""
            : usernameAvailable
            ? "green"
            : "red",
      },
    }}
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
            tabIndex={-1} // Aquí se evita el foco
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
            tabIndex={-1} // Aquí también
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
    <InputLabel id="departamento-label">Departamento</InputLabel>
    <Select
      labelId="departamento-label"
      name="departamentoId"
      value={formData.departamentoId}
      onChange={handleChange}
    >
      <MenuItem value="">
        <em>Seleccionar</em>
      </MenuItem>
      {departamentos.map((dep) => (
        <MenuItem key={dep.id} value={dep.id}>
          {dep.nombre}
        </MenuItem>
      ))}
    </Select>
    {errors.departamentoId && (
      <Typography color="error" variant="caption">
        {errors.departamentoId}
      </Typography>
    )}
  </FormControl>
            </Grid>
            <Grid item xs={6}>
            <FormControl fullWidth error={!!errors.cargoId}>
    <InputLabel id="cargo-label">Cargo</InputLabel>
    <Select
      labelId="cargo-label"
      name="cargoId"
      value={formData.cargoId}
      onChange={handleChange}
    >
      <MenuItem value="">
        <em>Seleccionar</em>
      </MenuItem>
      {cargos.map((cargo) => (
        <MenuItem key={cargo.id} value={cargo.id}>
          {cargo.nombre}
        </MenuItem>
      ))}
    </Select>
    {errors.cargoId && (
      <Typography color="error" variant="caption">
        {errors.cargoId}
      </Typography>
    )}
  </FormControl>
            </Grid>
          </Grid>

          {/* Botón de Registro */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            >
             Registrarme
          </Button>

          <Button
            variant="outlined"
            fullWidth
            sx={{ mt: 3 }}
            onClick={handleVolverClick}
            >
             Volver
          </Button>

        </Box>
      </Container>
    </ThemeProvider>
    </div>
  );
};

export default Register;





