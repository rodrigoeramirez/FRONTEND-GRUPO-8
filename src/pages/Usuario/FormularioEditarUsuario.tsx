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

const FormularioEditarUsuario = ({ usuario, onCancel, onSave }) => {
  
  const [errors, setErrors] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null); // Estado para validar que el mail no exista en la BD
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null); // Estado para validar que el mail no exista en la BD
  const [cambiarClave, setCambiarClave] = useState(false);
  const [nuevaClave, setNuevaClave] = useState("");
  const [repetirClave, setRepetirClave] = useState("");
  const [formData, setFormData] = useState({
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    username: usuario.username,
    email:usuario.email,
    cargo_id: usuario.cargo_id,
    departamento_id: usuario.departamento_id,
    clave:""
  });


  console.log(usuario);
  const {getUsuarios, validateEmail, validateUsername, } = useUsuario();
  // Con este useEffect ejecuto el metodo getEstados.
  useEffect(()=>{
    getUsuarios();
  },[]); // [] esto hace que se ejecute una sola vez.

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

  const validateCorreo = async (email) => {
    if (!email || email === usuario.email) { // Si el email no cambia, no valida
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
  
  const validateUser = async (username) => {
    if (!username || username === usuario.username) { // Si el username no cambia, no valida
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

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  // Valido el formulario.
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

  // Valido la clave.
  const validateClave = () => {
    if (cambiarClave) {
      if (nuevaClave !== repetirClave) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          clave: "Las claves no coinciden.",
        }));
        return false;
      }
      if (!nuevaClave || !repetirClave) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          clave: "La clave no puede estar vacía.",
        }));
        return false;
      }
    }
    return true;
  };
  
 // Devuelve el control y los datos a PageUsuario para llamar al endpoint y realizar la edición en la BD.
 const handleSave = () => {
  if (validateForm() && validateClave()) {
    const dataToSave = {
      ...formData,
      // Solo asigna la clave si se va a cambiar y si 'nuevaClave' no está vacía
      clave: cambiarClave && nuevaClave ? nuevaClave : undefined, // Si no cambia la clave, la clave se deja como undefined
    };

    if (onSave) {
      //console.log("Esto es modificadoooooo:", dataToSave);
      onSave(dataToSave, usuario.legajo); // Guarda los datos
    }
    onCancel();
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
    value={formData.cargo_id}  // Este valor debe estar sincronizado con formData
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
    value={formData.departamento_id}  // Este valor debe estar sincronizado con formData
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
      <Button
        variant="outlined"
        onClick={() => setCambiarClave(!cambiarClave)}
        color="primary"
      >
        {cambiarClave ? "Cancelar cambio de clave" : "Cambiar clave"}
      </Button>

      {cambiarClave && (
  <>
    <TextField
      label="Nueva clave"
      fullWidth
      type="password"
      value={nuevaClave}
      onChange={(e) => setNuevaClave(e.target.value)}
      margin="normal"
    />
    <TextField
      label="Repetir nueva clave"
      fullWidth
      type="password"
      value={repetirClave}
      onChange={(e) => setRepetirClave(e.target.value)}
      margin="normal"
    />
  </>
)}


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

export default FormularioEditarUsuario;