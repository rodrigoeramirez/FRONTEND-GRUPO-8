import { useEffect, useState } from "react";
import { useUsuario } from "../../context/UsuarioContext";
import { useCargo } from "../../context/CargoContext";
import { useDepartamento } from "../../context/DepartamentoContext";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl, FormHelperText,
  InputAdornment,
  IconButton
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const FormularioEditarUsuario = ({ usuario, onCancel, onSave }) => {
  const [errors, setErrors] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [cambiarClave, setCambiarClave] = useState(false);
  const [nuevaClave, setNuevaClave] = useState("");
  const [repetirClave, setRepetirClave] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(""); // Estado para el error de coincidencia de contraseñas

  const [formData, setFormData] = useState({
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    username: usuario.username,
    email: usuario.email,
    cargo_id: usuario.cargo_id,
    departamento_id: usuario.departamento_id,
    clave: ""
  });

  const { getUsuarios, validateEmail, validateUsername } = useUsuario();
  const { cargos, getCargos } = useCargo();
  const { departamentos, getDepartamentos } = useDepartamento();

  useEffect(() => {
    getUsuarios();
    getCargos();
    getDepartamentos();
  }, []);

  const validateCorreo = async (email) => {
    if (!email || email === usuario.email) {
      setEmailAvailable(null);
      return;
    }
    try {
      const response = await validateEmail(email);
      setEmailAvailable(response);
    } catch (error) {
      console.error("Error validando el email:", error);
      setEmailAvailable(false);
    }
  };

  const validateUser = async (username) => {
    if (!username || username === usuario.username) {
      setUsernameAvailable(null);
      return;
    }
    try {
      const response = await validateUsername(username);
      setUsernameAvailable(response);
    } catch (error) {
      console.error("Error validando el username:", error);
      setUsernameAvailable(false);
    }
  };

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!formData.apellido.trim()) newErrors.apellido = "El apellido es obligatorio.";
    if (!formData.username.trim()) newErrors.username = "El username es obligatorio.";
    if (!formData.email.trim()) newErrors.email = "El email es obligatorio.";
    if (!formData.cargo_id) newErrors.cargo_id = "Debe seleccionar un cargo.";
    if (!formData.departamento_id) newErrors.departamento_id = "Debe seleccionar un departamento.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateClave = () => {
    if (cambiarClave) {
      if (!nuevaClave || !repetirClave) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          clave: "La clave no puede estar vacía.",
        }));
        return false;
      }
      if (nuevaClave !== repetirClave) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          clave: "Las claves no coinciden.",
        }));
        return false;
      }
    }
    return true;
  };

  const handleSave = () => {
    if (validateForm() && validateClave()) {
      const dataToSave = {
        ...formData,
        clave: cambiarClave && nuevaClave ? nuevaClave : undefined,
      };
      if (onSave) {
        onSave(dataToSave, usuario.legajo, usuario.username);
      }
      onCancel();
    }
  };

  // Validar coincidencia de contraseñas mientras se escribe
  const validatePasswordMatch = (value) => {
    if (value !== nuevaClave) {
      setPasswordMatchError("Las contraseñas no coinciden.");
    } else {
      setPasswordMatchError("");
    }
  };

  return (
    <Box sx={{ mt: 0 }}>
      <TextField
        label="Nombre"
        fullWidth
        value={formData.nombre}
        onChange={handleChange("nombre")}
        margin="normal"
        error={!!errors.nombre}
        helperText={errors.nombre}
      />
      <TextField
        label="Apellido"
        fullWidth
        value={formData.apellido}
        onChange={handleChange("apellido")}
        margin="normal"
        error={!!errors.apellido}
        helperText={errors.apellido}
      />
      <TextField
        label="Nombre de Usuario"
        name="username"
        margin="normal"
        value={formData.username}
        onChange={(e) => {
          const newUsername = e.target.value;
          setFormData({ ...formData, username: newUsername });
          setErrors({ ...errors, username: "" });
          validateUser(newUsername);
        }}
        fullWidth
        error={!!errors.username || usernameAvailable === false}
        helperText={
          errors.username ||
          (usernameAvailable === false ? "El username ya está en uso." : "")
        }
        sx={{
          "& .MuiOutlinedInput-root": {
            borderColor: usernameAvailable === null
              ? ""
              : usernameAvailable
              ? "green"
              : "red",
          },
        }}
      />
      <TextField
        label="Email"
        margin="normal"
        value={formData.email}
        onChange={(e) => {
          const newEmail = e.target.value;
          setFormData({ ...formData, email: newEmail });
          setErrors({ ...errors, email: "" });
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
            validateCorreo(email);
          }
        }}
        fullWidth
        error={!!errors.email || emailAvailable === false}
        helperText={
          errors.email ||
          (emailAvailable === false ? "El email ya está en uso." : "")
        }
      />
      <FormControl fullWidth margin="normal" error={!!errors.cargo_id}>
        <InputLabel>Cargo</InputLabel>
        <Select
          value={formData.cargo_id}
          onChange={handleChange("cargo_id")}
          label="Cargo"
        >
          {cargos.map((cargo) => (
            <MenuItem key={cargo.id} value={cargo.id}>
              {cargo.nombre}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{errors.cargo_id}</FormHelperText>
      </FormControl>
      <FormControl fullWidth margin="normal" error={!!errors.departamento_id}>
        <InputLabel>Departamento</InputLabel>
        <Select
          value={formData.departamento_id}
          onChange={handleChange("departamento_id")}
          label="Departamento"
        >
          {departamentos.map((departamento) => (
            <MenuItem key={departamento.id} value={departamento.id}>
              {departamento.nombre}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{errors.departamento_id}</FormHelperText>
      </FormControl>
      <Button variant="outlined" onClick={() => setCambiarClave(!cambiarClave)} color="primary">
        {cambiarClave ? "Cancelar cambio de clave" : "Cambiar clave"}
      </Button>

      {cambiarClave && (
        <>
          <TextField
            label="Nueva clave"
            fullWidth
            type={showPassword ? "text" : "password"}
            value={nuevaClave}
            onChange={(e) => setNuevaClave(e.target.value)}
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Repetir nueva clave"
            fullWidth
            type={showRepeatPassword ? "text" : "password"}
            value={repetirClave}
            onChange={(e) => {
              setRepetirClave(e.target.value);
              validatePasswordMatch(e.target.value); // Validar coincidencia mientras se escribe
            }}
            margin="normal"
            error={!!passwordMatchError}
            helperText={passwordMatchError}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowRepeatPassword(!showRepeatPassword)} edge="end">
                    {showRepeatPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </>
      )}
      <Box
        sx={{
          position: "sticky",
          bottom: 0,
          backgroundColor: "#fff",
          boxShadow: "0px -2px 10px rgba(0, 0, 0, 0.1)",
          p: 2,
          zIndex: 1000,
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
        }}
      >
        <Button variant="outlined" onClick={onCancel} color="error">
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSave} color="primary">
          Guardar Cambios
        </Button>
      </Box>
    </Box>
  );
};

export default FormularioEditarUsuario;