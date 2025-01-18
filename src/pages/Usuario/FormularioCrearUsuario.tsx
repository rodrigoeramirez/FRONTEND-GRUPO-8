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
  FormControl, FormHelperText
} from "@mui/material";

const FormularioCrearUsuario = ({ onCancel, onSave }) => {

  const {getUsuarios, validateEmail, validateUsername, } = useUsuario();
  // Con este useEffect ejecuto el metodo getEstados.
  useEffect(()=>{
    getUsuarios();
  },[]); // [] esto hace que se ejecute una sola vez.

  //console.log(usuarios);
  
  // Esto lo hago para obtener los cargos
  const {cargos, getCargos,} = useCargo();
  useEffect(()=>{
    getCargos();
  },[]);

  // Esto lo hago para obtener los departamentos
  const {departamentos, getDepartamentos,} = useDepartamento();
  useEffect(()=>{
    getDepartamentos();
  },[]);

  //console.log(departamentos);

  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null); // Estado para validar que el mail no exista en la BD

  const validateCorreo = async (email) => {

    if (!email) {
      setEmailAvailable(null); // Si no hay texto reinicia el estado
      return;
    }

    try {
      const response = await validateEmail(email);

      if (response) { // Si la respuesta es verdadera (email disponible)
        setEmailAvailable(response); 
      } else {
        setEmailAvailable(false); // Si no está disponible o hubo un error
      }
      
    } catch (error) {
      console.error("Error validando el email:", error);
      setEmailAvailable(false); // Manejar errores
    }

  };

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null); // Estado para validar que el mail no exista en la BD

  const validateUser = async (username) => {

    if (!username) {
      setUsernameAvailable(null); // Si no hay texto reinicia el estado
      return;
    }

    try {
      const response = await validateUsername(username);

      if (response) { // Si la respuesta es verdadera (username disponible)
        setUsernameAvailable(response); 
      } else {
        setUsernameAvailable(false); // Si no está disponible o hubo un error
      }
      
    } catch (error) {
      console.error("Error validando el email:", error);
      setEmailAvailable(false); // Manejar errores
    }

  };

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    username: "",
    email:"",
    cargo_id: "",
    departamento_id: "",
    clave:"",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio.";
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = "El apellido es obligatorio.";
    }

    if (!formData.apellido.trim()) {
        newErrors.username = "El username es obligatorio.";
    }

    if (!formData.email.trim()) {
        newErrors.email = "El email es obligatorio.";
    }
    if (!formData.cargo_id) {
        newErrors.cargo_id = "Debe seleccionar un cargo.";
    }
    if (!formData.departamento_id) {
        newErrors.departamento_id = "Debe seleccionar un departamento.";
    }

    setErrors(newErrors);

    // Retorna true si no hay errores
    return Object.keys(newErrors).length === 0;
  };

  const generateRandomPassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    return Array.from({ length: 12 }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
  };
  

  const handleSave = () => {
    if (validateForm()) {
      const generatedPassword = generateRandomPassword();
      const dataToSave = { ...formData, clave: generatedPassword };
  
      if (onSave) {
        onSave(dataToSave); // Devuelve los datos incluyendo la clave generada.
      }
      // Limpia el formulario
      setFormData({
        nombre: "",
        apellido: "",
        username: "",
        email:"",
        cargo_id: "",
        departamento_id: "",
        clave:"",
      });
      onCancel(); // Cierra el popup después de guardar
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
      setErrors({ ...errors, username: "" }); // Limpia el error al escribir
      validateUser(newUsername);
    }}
    fullWidth
    error={!!errors.username || usernameAvailable === false} // Error si está vacío o no disponible
    helperText={
      errors.username || // Muestra el mensaje de error si está vacío
      (usernameAvailable === false ? "El username ya está en uso." : "") // Si no está disponible
    }
    sx={{
      "& .MuiOutlinedInput-root": {
        borderColor: usernameAvailable === null
          ? "" // Sin color cuando no se ha validado
          : usernameAvailable
          ? "green" // Verde si está disponible
          : "red", // Rojo si no está disponible
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
        validateCorreo(email); // Llama a la validación de la BD si el formato es válido
      }
    }}
    fullWidth
    error={!!errors.email || emailAvailable === false} // Marca como error si el formato o la disponibilidad fallan
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
        <MenuItem key={cargo.id} value={cargo.id}>{cargo.nombre}</MenuItem>
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
        <MenuItem key={departamento.id} value={departamento.id}>{departamento.nombre}</MenuItem>
      ))}
    </Select>
    <FormHelperText>{errors.departamento_id}</FormHelperText>
  </FormControl>
  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
    <Button variant="outlined" onClick={onCancel} color="error">
      Cancelar
    </Button>
    <Button variant="contained" onClick={handleSave} color="primary">
      Guardar
    </Button>
  </Box>
</Box>

  );
};

export default FormularioCrearUsuario;