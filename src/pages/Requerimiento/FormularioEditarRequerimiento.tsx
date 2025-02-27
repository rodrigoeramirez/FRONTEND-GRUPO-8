import { useEffect, useState } from "react";
import { Box, Button, TextField, MenuItem, Select, InputLabel, FormControl, FormHelperText, Typography,Accordion,AccordionSummary,AccordionDetails, Card, Grid, } from "@mui/material";
import { useTipoRequerimiento } from "../../context/TipoRequerimientoContext";
import { useEstado } from "../../context/EstadoContext";
import { usePrioridad } from "../../context/PrioridadContext";
import { useUsuario } from "../../context/UsuarioContext";
import { useRequerimiento } from "../../context/RequerimientoContext";
import { useArchivoAdjunto } from "../../context/ArchivoAdjuntoContext";
import Autocomplete from "@mui/material/Autocomplete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useComentarioRequerimiento } from "../../context/ComentarioRequerimientoContext";
import { useAuth } from '../../context/AuthContext.tsx';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LinkIcon from '@mui/icons-material/Link';
import CommentIcon from '@mui/icons-material/Comment';


const FormularioEditarRequerimiento = ({ requerimiento, onCancel, onSave }) => {
  const [formData, setFormData] = useState({ ...requerimiento });// Copio el contenido de requerimiento a formData.
  const [errors, setErrors] = useState({}); // Para validadr errores.
  const [filteredCategorias, setFilteredCategorias] = useState([]); // Para filtrar las categorias dependiendo del Tipo Requerimiento.
  const [archivosExistentes, setArchivosExistentes] = useState(requerimiento.archivosAdjuntos || []);
  const { tipos, getTipoRequerimiento } = useTipoRequerimiento();
  const { estados, getEstados } = useEstado();
  const { prioridades, getPrioridades } = usePrioridad();
  const { usuarios, getUsuarios } = useUsuario();
  const { getArchivoAdjunto, deleteArchivoAdjunto } = useArchivoAdjunto();
  const {requerimientos,getRequerimientos, getUltimoSecuencial} = useRequerimiento();
  const { comentarios, getComentariosByRequerimiento, createComentarioRequerimiento } = useComentarioRequerimiento();
  const [nuevoComentario, setNuevoComentario] = useState({ asunto: "", descripcion: "", archivosAdjuntos: [] });
  const [prevTipoRequerimientoId, setPrevTipoRequerimientoId] = useState(requerimiento.tipoRequerimientoId); // Guardamos el tipo original
  const [originalCodigo, setOriginalCodigo] = useState(requerimiento.codigo); // Guardamos el código original
  const { userInfo } = useAuth(); // Lo utilizo para obtener el id del usuario logeado y cargar en el formulario el emisor.
  

  // Uso las funciones del context
  useEffect(() => {
    getEstados();
    getPrioridades();
    getUsuarios();
    getRequerimientos();
  }, []);

  useEffect(() => {
    getTipoRequerimiento();

  }, [getTipoRequerimiento]);
  

  useEffect(() => {
    getComentariosByRequerimiento(requerimiento.codigo);
  }, [requerimiento.codigo]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const formatosPermitidos = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    
    const archivosValidos = files.filter((file) => formatosPermitidos.includes(file.type));

    if (archivosValidos.length + nuevoComentario.archivosAdjuntos.length > 5) {
      alert("Solo puedes adjuntar hasta 5 archivos en un comentario.");
      return;
    }

    setNuevoComentario((prev) => ({
      ...prev,
      archivosAdjuntos: [...prev.archivosAdjuntos, ...archivosValidos],
    }));
  };

  const formatearFecha = (fecha) => {
    const opciones = {
      weekday: 'long', // Día de la semana
      year: 'numeric', // Año completo
      month: 'long', // Mes completo
      day: 'numeric', // Día del mes
      hour: '2-digit', // Hora con dos dígitos
      minute: '2-digit', // Minutos con dos dígitos
    };
  
    return new Intl.DateTimeFormat('es-ES', opciones).format(new Date(fecha));
  };

  const handleAgregarComentario = async () => {
    if (!nuevoComentario.asunto || !nuevoComentario.descripcion) {
      alert("El asunto y la descripción no pueden estar vacíos.");
      return;
    }

    const formData = new FormData();
    const comentarioData = {
      requerimientoCodigo: requerimiento.codigo,
      usuarioEmisorId: userInfo?.legajo,
      asunto: nuevoComentario.asunto,
      descripcion: nuevoComentario.descripcion,
      fechaHora: new Date().toISOString(),
    };

    formData.append("comentario", new Blob([JSON.stringify(comentarioData)], { type: "application/json" }));

    if (nuevoComentario.archivosAdjuntos.length > 0) {
      nuevoComentario.archivosAdjuntos.forEach((file) => {
        formData.append("archivos", file);
      });
    }

    try {
      await createComentarioRequerimiento(formData);
      getComentariosByRequerimiento(requerimiento.codigo);
      setNuevoComentario({ asunto: "", descripcion: "", archivosAdjuntos: [] });
    } catch (error) {
      console.error("Error al agregar comentario:", error);
    }
  };

  // Cuando cambia el tipo de requerimiento, actualizamos el código si es necesario
  useEffect(() => {
    const fetchCodigo = async () => {
      // Si el tipo cambia y es diferente al tipo original
      if (formData.tipoRequerimientoId !== prevTipoRequerimientoId) {
        try {
          const secuencial = (await getUltimoSecuencial(formData.tipoRequerimientoId));
          const anio = new Date().getFullYear();
          const tipoSeleccionado = tipos.find((tipo) => tipo.id === formData.tipoRequerimientoId);

          if (!tipoSeleccionado) return;

          const codigoGenerado = `${tipoSeleccionado.codigo}-${anio}-${String(secuencial).padStart(10, "0")}`;

          // Actualizamos el estado con el nuevo código generado
          setFormData((prev) => ({ ...prev, codigo: codigoGenerado }));
        } catch (error) {
          console.error("Error al generar el código:", error);
        }
      } else if (formData.tipoRequerimientoId === prevTipoRequerimientoId) {
        // Si el tipo vuelve al original, restauramos el código original
        setFormData((prev) => ({ ...prev, codigo: originalCodigo }));
      }
    };

    fetchCodigo();
  }, [formData.tipoRequerimientoId, tipos, prevTipoRequerimientoId, originalCodigo]);

  // Obtengo las categorias segun el Tipo de Requerimiento
  useEffect(() => {
    if (formData.tipoRequerimientoId) {
      const tipoSeleccionado = tipos.find((tipo) => tipo.id === formData.tipoRequerimientoId);
      setFilteredCategorias(tipoSeleccionado ? tipoSeleccionado.categorias : []);
    } else {
      setFilteredCategorias([]);
    }
  }, [formData.tipoRequerimientoId, tipos]);


  
   // Mantener archivos existentes sin enviarlos en la actualización
  const archivosNuevos = formData.nuevosArchivos || [];

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const formatosPermitidos = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const archivosValidos = files.filter((file) => formatosPermitidos.includes(file.type));

    if (archivosValidos.length < files.length) {
      setErrors((prev) => ({ ...prev, archivosAdjuntos: "Solo se permiten archivos Word, PDF o Excel." }));
      return;
    }

    if (archivosValidos.length + archivosExistentes.length + archivosNuevos.length > 5) {
      setErrors((prev) => ({ ...prev, archivosAdjuntos: "Máximo 5 archivos permitidos." }));
      return;
    }

    const nuevosArchivos = archivosValidos.filter(
      (file) =>
        !archivosNuevos.some((a) => a.name === file.name) &&
        !archivosExistentes.some((a) => a.nombreOriginal === file.name)
    );

    if (nuevosArchivos.length < archivosValidos.length) {
      setErrors((prev) => ({ ...prev, archivosAdjuntos: "Algunos archivos ya fueron agregados." }));
    } else {
      setErrors((prev) => ({ ...prev, archivosAdjuntos: "" }));
    }

    setFormData((prev) => ({
      ...prev,
      nuevosArchivos: [...archivosNuevos, ...nuevosArchivos],
    }));

    event.target.value = null;
  };  
  

  const handleRemoveFile = (index) => {
    const nuevosArchivos = archivosNuevos.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, nuevosArchivos }));
  };

  const handleDescarga = (ruta) => {
    getArchivoAdjunto(ruta);
  };

  const handleEliminarArchivo = async (archivoId) => {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este archivo adjunto?");
    if (!confirmacion) return;
  
    try {
      await deleteArchivoAdjunto(archivoId);
  
      // 🔥 ACTUALIZAR UI EN TIEMPO REAL
      setFormData((prev) => ({
        ...prev,
        archivosAdjuntos: prev.archivosAdjuntos?.filter((archivo) => archivo.id !== archivoId) || [],
      }));
  
      setArchivosExistentes((prev) => prev.filter((archivo) => archivo.id !== archivoId));
  
    } catch (error) {
      console.error("Error al eliminar archivo adjunto:", error);
    }
  };
  

    // En el handleChange puedo realizar validacion en tiempo real (mientras escribo).
  // En lugar de crear una función separada para cada campo, handleChange se adapta dinámicamente según el campo que está siendo modificado.
  // La función está definida como una función de orden superior. Es decir, devuelve otra función.
  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { //Es el evento del cambio generado por React cuando el usuario escribe en el campo.
    const value = event.target.value; // Cuando un usuario escribe en un campo, el valor ingresado se obtiene desde acá.
    
    // Validar longitud para el campo "descripcion"
    if (field === "descripcion" && value.length >5000) {
        // Se agrega un mensaje de error al estado errors.
        setErrors((prev) => ({
            ...prev,
            descricpion: "La descripcion no puede exceder los 5000 caracteres.",
        }));
        return;    
    } else if (field === "descripcion") {
        // Eliminar el error si la longitud es valida
        setErrors((prev) => ({
            ...prev,
            asunto:"",
        }));
    }
  
    // Validar longitud para el campo "asunto"
    if (field === "asunto" && value.length > 50) {
      setErrors((prev) => ({
        ...prev,
        asunto: "El asunto no puede exceder los 50 caracteres.",
      }));
      return;
    } else if (field === "asunto") {
      // Eliminar el error si la longitud es válida
      setErrors((prev) => ({
        ...prev,
        asunto: "",
      }));
    }
  
    // Si no hay errores, el valor del campo actual se actualiza en formData. Esto se hace copiando el estado actual de formData y reemplazando solo el campo que fue modificado
    setFormData({
      ...formData, // copia todos los campos actuales del formulario.
      [field]: value, // sobrescribe el campo que fue modificado con el nuevo valor.
    });
  };


  const validateForm = () => {
    const newErrors = {};
  
    if (!formData.codigo || !formData.codigo.trim()) {
      newErrors.codigo = "El código es obligatorio.";
    }
    if (!formData.prioridadRequerimientoId) {
      newErrors.prioridad = "Debe seleccionar una prioridad.";
    }
    if (!formData.tipoRequerimientoId) {
      newErrors.tipo = "Debe seleccionar un tipo.";
    }
    if (!formData.estadoRequerimientoId) {
      newErrors.estado = "Debe seleccionar un estado.";
    }
    if (!formData.asunto || !formData.asunto.trim()) {
      newErrors.asunto = "El asunto es obligatorio.";
    }
    if (!formData.descripcion || !formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción es obligatoria.";
    }
    if (!formData.categoriaRequerimientoId) {
      newErrors.categoria = "Debe seleccionar una categoría.";
    }
    
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  const handleSave = () => {
    if (validateForm()) {

      // Crear el objeto de datos del requerimiento
      const dataToSave = {
        codigo: formData.codigo,
        asunto: formData.asunto,
        descripcion: formData.descripcion,
        tipoRequerimientoId: formData.tipoRequerimientoId,
        estadoRequerimientoId: formData.estadoRequerimientoId,
        prioridadRequerimientoId: formData.prioridadRequerimientoId,
        emisorLegajo: formData.emisorLegajo,
        destinatarioId: formData.destinatarioId || null,
        requerimientosRelacionadosCodigos: (formData.requerimientosRelacionados || []).map(req => req.codigo), // Asegurar que siempre sea un array, //IDs para vincular con los requerimientos
      };

      console.log("Esto es lo que se envia",dataToSave);
  
      // Crear un objeto FormData
      const formDataToSend = new FormData();
  
      // Agregar los datos del requerimiento en formato JSON
      formDataToSend.append("requerimiento", new Blob([JSON.stringify(dataToSave)], { type: "application/json" }));
  
      // Agregar los archivos adjuntos si hay
      if (archivosNuevos.length > 0) {
        archivosNuevos.forEach((file) => {
          formDataToSend.append("archivos", file);
        });
      }
  
      // Llamar a la función de guardado con el FormData
      if (onSave) {
        onSave(formDataToSend, requerimiento.codigo);
      }
      
      onCancel(); // Cierra el formulario después de guardar
    }
  };


  return (
    
    <Box sx={{ mt: 2 }}>
  <Grid container spacing={3}>
    {/* Columna izquierda */}
    <Grid item xs={12} md={6}>
      {/* Código */}
      <TextField
        label="Código"
        fullWidth
        value={formData.codigo}
        disabled
        margin="normal"
      />

      {/* Fecha */}
      <TextField
        label="Fecha"
        fullWidth
        value={formatearFecha(formData.fechaHoraAlta)}
        disabled
        margin="normal"
      />

      {/* Tipo de Requerimiento */}
      <FormControl fullWidth margin="normal" error={!!errors.tipo}>
        <InputLabel>Tipo de Requerimiento</InputLabel>
        <Select
          value={formData.tipoRequerimientoId}
          onChange={handleChange("tipoRequerimientoId")}
        >
          {tipos.map((tipo) => (
            <MenuItem key={tipo.id} value={tipo.id}>
              {tipo.descripcion}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{errors.tipo}</FormHelperText>
      </FormControl>

      {/* Categoría Requerimiento */}
      <FormControl fullWidth margin="normal" error={!!errors.categoria}>
        <InputLabel>Categoría</InputLabel>
        <Select
          value={formData.categoriaRequerimientoId}
          onChange={handleChange("categoriaRequerimientoId")}
        >
          {filteredCategorias.map((categoria) => (
            <MenuItem key={categoria.id} value={categoria.id}>
              {categoria.descripcion}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{errors.categoria}</FormHelperText>
      </FormControl>

      {/* Prioridad */}
      <FormControl fullWidth margin="normal" error={!!errors.prioridad}>
        <InputLabel>Prioridad</InputLabel>
        <Select
          value={formData.prioridadRequerimientoId}
          onChange={handleChange("prioridadRequerimientoId")}
        >
          {prioridades.map((prioridad) => (
            <MenuItem key={prioridad.id} value={prioridad.id}>
              {prioridad.nombre}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{errors.prioridad}</FormHelperText>
      </FormControl>

      {/* Asunto */}
      <TextField
        label="Asunto"
        fullWidth
        value={formData.asunto}
        onChange={handleChange("asunto")}
        margin="normal"
        error={!!errors.asunto}
        helperText={errors.asunto || `Máximo 50 caracteres (${formData.asunto.length}/50)`}
      />

      {/* Descripción */}
      <TextField
        label="Descripción"
        fullWidth
        multiline
        rows={4}
        value={formData.descripcion}
        onChange={handleChange("descripcion")}
        margin="normal"
        error={!!errors.descripcion}
        helperText={errors.descripcion || `Máximo 5000 caracteres (${formData.descripcion.length}/5000)`}
      />

      {/* Destinatario */}
      <FormControl fullWidth margin="normal">
        <Autocomplete
          options={[{ legajo: null, nombre: "Sin destinatario", apellido: "" }, ...usuarios]}
          getOptionLabel={(option) =>
            option?.legajo === null ? "Sin destinatario" : `${option.nombre} ${option.apellido}`
          }
          value={usuarios.find((user) => user.legajo === formData.destinatarioId) || null}
          onChange={(event, newValue) => {
            const nuevoEstado = newValue?.legajo
              ? estados.find((estado) => estado.nombre === "Asignado")?.id
              : estados.find((estado) => estado.nombre === "Abierto")?.id;

            setFormData({
              ...formData,
              destinatarioId: newValue?.legajo || null,
              estadoRequerimientoId: nuevoEstado || "",
            });

            if (newValue?.legajo) {
              setErrors({
                ...errors,
                estado: "",
              });
            }
          }}
          isOptionEqualToValue={(option, value) => option?.legajo === value?.legajo}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Destinatario (opcional)"
              placeholder="Buscar destinatario"
              margin="normal"
              error={!!errors.destinatario}
              helperText={errors.destinatario}
            />
          )}
          renderOption={(props, option) => {
            const { key, ...restProps } = props;
            return (
              <li key={option.legajo ?? "sin-destinatario"} {...restProps} style={{ color: option.legajo === null ? "gray" : "inherit" }}>
                {option.legajo === null ? "Sin destinatario" : `${option.nombre} ${option.apellido}`}
              </li>
            );
          }}
          disableClearable={false}
          clearOnEscape
        />
      </FormControl>

      {/* Estado */}
      <FormControl fullWidth margin="normal" error={!!errors.estado}>
        <InputLabel>Estado</InputLabel>
        <Select
          value={formData.estadoRequerimientoId}
          onChange={handleChange("estadoRequerimientoId")}
        >
          {estados.map((estado) => (
            <MenuItem key={estado.id} value={estado.id}>
              {estado.nombre}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{errors.estado}</FormHelperText>
      </FormControl>
    </Grid>

    {/* Columna derecha */}
    <Grid item xs={12} md={6}>
      {/* Archivos Adjuntos */}
      <Card sx={{ mb: 3, p: 2, backgroundColor: "#fafafa" }}>
        <Accordion sx={{ boxShadow: "none", backgroundColor: "transparent" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AttachFileIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                Archivos Adjuntos ({archivosNuevos.length + archivosExistentes.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Button variant="contained" component="label" sx={{ mb: 2 }}>
              Subir Archivos (Máximo 5)
              <input type="file" hidden multiple accept=".doc,.docx,.pdf,.xls,.xlsx" onChange={handleFileUpload} />
            </Button>

            {errors.archivosAdjuntos && <FormHelperText error>{errors.archivosAdjuntos}</FormHelperText>}

            {/* Archivos Nuevos */}
            {archivosNuevos.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Archivos para adjuntar:</strong></Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                  {archivosNuevos.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1,
                        border: "1px solid #e0e0e0",
                        borderRadius: "5px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <InsertDriveFileIcon color="primary" />
                        <Typography sx={{ fontWeight: "bold" }}>{file.name}</Typography>
                      </Box>
                      <Button size="small" color="error" onClick={() => handleRemoveFile(index)}>
                        Quitar
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {/* Archivos Existentes */}
            {archivosExistentes.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Archivos adjuntos cargados:</strong></Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                  {archivosExistentes.map((file, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1,
                        border: "1px solid #e0e0e0",
                        borderRadius: "5px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <InsertDriveFileIcon color="primary" />
                        <Typography sx={{ fontWeight: "bold" }}>{file.nombreOriginal}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button size="small" color="primary" onClick={() => handleDescarga(file.ruta)}>
                          Descargar
                        </Button>
                        <Button size="small" color="error" onClick={() => handleEliminarArchivo(file.id)}>
                          Eliminar
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {archivosNuevos.length === 0 && archivosExistentes.length === 0 && (
              <Typography sx={{ color: "#757575", fontStyle: "italic" }}>
                No posee archivos adjuntos.
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      </Card>

      {/* Requerimientos Relacionados */}
<Card sx={{ mb: 3, p: 2, backgroundColor: "#fafafa" }}>
  <Accordion sx={{ boxShadow: "none", backgroundColor: "transparent" }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <LinkIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
          Requerimientos Relacionados ({formData.requerimientosRelacionados?.length || 0})
        </Typography>
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      <FormControl fullWidth margin="normal">
        <Autocomplete
          multiple
          options={requerimientos.filter(
            (req) => !(formData.requerimientosRelacionados || []).some((rel) => rel.codigo === req.codigo)
          )}
          getOptionLabel={(option) => `${option.codigo} - ${option.descripcion}`}
          value={formData.requerimientosRelacionados || []}
          onChange={(event, newValue) => {
            setFormData({
              ...formData,
              requerimientosRelacionados: newValue,
            });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Vincular con otro Requerimiento"
              placeholder="Buscar por código o descripción"
              margin="normal"
            />
          )}
        />
      </FormControl>
    </AccordionDetails>
  </Accordion>
</Card>


      {/* Comentarios */}
      <Card sx={{ p: 2, backgroundColor: "#fafafa" }}>
        <Accordion sx={{ boxShadow: "none", backgroundColor: "transparent" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CommentIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                Comentarios ({comentarios.length})
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {comentarios.length > 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {comentarios.map((comentario, index) => (
                  <Card key={index} sx={{ p: 2, boxShadow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                      {comentario.username} - {comentario.fechaHora}
                    </Typography>
                    <Typography sx={{ fontWeight: "bold" }}>{comentario.asunto}</Typography>
                    <Typography sx={{ mt: 1, color: "#555" }}>{comentario.descripcion}</Typography>
                    {comentario.archivosAdjuntos && comentario.archivosAdjuntos.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                          Archivos Adjuntos:
                        </Typography>
                        {comentario.archivosAdjuntos.map((file, fileIndex) => (
                          <Box
                            key={fileIndex}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              p: 1,
                              border: "1px solid #e0e0e0",
                              borderRadius: "4px",
                              mt: 1,
                            }}
                          >
                            <InsertDriveFileIcon color="primary" />
                            <Typography>{file.nombreOriginal}</Typography>
                            <Button
                              onClick={() => getArchivoAdjunto(file.ruta)}
                              sx={{ color: "#1976d2", fontWeight: "bold" }}
                            >
                              Descargar
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography sx={{ color: "#757575", fontStyle: "italic" }}>
                No hay comentarios.
              </Typography>
            )}

            {/* Agregar Comentario */}
            {(formData.emisorLegajo === userInfo?.legajo || formData.destinatarioId === userInfo?.legajo || formData.estadoRequerimientoNombre === "Asignado") && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  Agregar Comentario
                </Typography>
                <TextField
                  fullWidth
                  label="Asunto"
                  variant="outlined"
                  size="small"
                  value={nuevoComentario.asunto}
                  onChange={(e) => setNuevoComentario({ ...nuevoComentario, asunto: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Descripción"
                  variant="outlined"
                  size="small"
                  multiline
                  rows={3}
                  value={nuevoComentario.descripcion}
                  onChange={(e) => setNuevoComentario({ ...nuevoComentario, descripcion: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <Button variant="outlined" component="label" sx={{mt:1}}>
                  Subir Archivos
                  <input type="file" hidden multiple onChange={handleFileChange} />
                </Button>
                {nuevoComentario.archivosAdjuntos.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    {nuevoComentario.archivosAdjuntos.map((file, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 1,
                          mb: 1,
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <InsertDriveFileIcon color="primary" />
                          <Typography>{file.name}</Typography>
                        </Box>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => {
                            const nuevosArchivos = nuevoComentario.archivosAdjuntos.filter((_, i) => i !== index);
                            setNuevoComentario({ ...nuevoComentario, archivosAdjuntos: nuevosArchivos });
                          }}
                        >
                          Quitar
                        </Button>
                      </Box>
                    ))}
                  </Box>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAgregarComentario}
                  sx={{ ml:1  ,mt: 1 }}
                >
                  Agregar Comentario
                </Button>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Card>
      
    </Grid>
    
  </Grid>
  {/* Botones fijos en la parte inferior */}
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

export default FormularioEditarRequerimiento;
