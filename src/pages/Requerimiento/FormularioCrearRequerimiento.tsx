import { useEffect, useState } from "react";
import {Box,Button,TextField,MenuItem,Select,InputLabel,FormControl,FormHelperText,} from "@mui/material";
import { useTipoRequerimiento } from "../../context/TipoRequerimientoContext";
import { useEstado } from "../../context/EstadoContext";
import { usePrioridad } from "../../context/PrioridadContext";
import { useUsuario } from "../../context/UsuarioContext";
import { useRequerimiento } from "../../context/RequerimientoContext";
import Autocomplete from "@mui/material/Autocomplete";
import { InsertDriveFile } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";

const FormularioCrearRequerimiento = ({ onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    codigo: "",
    prioridad: "",
    tipo: "",
    categoria: "",
    estado: "",
    destinatario: "",
    asunto: "",
    descripcion: "",
    archivosAdjuntos: [],
    requerimientosVinculados: [],
  });


  const [errors, setErrors] = useState({});
  const [filteredCategorias, setFilteredCategorias] = useState([]); // Se usa para filtrar las categorias segun el tipo de requerimiento.

  // Cargar datos de los contextos
  const { tipos, getTipoRequerimiento } = useTipoRequerimiento();
  const { estados, getEstados } = useEstado();
  const { prioridades, getPrioridades } = usePrioridad();
  const { usuarios, getUsuarios } = useUsuario();
  const {requerimientos, getRequerimientos, getUltimoSecuencial} = useRequerimiento();
  const { userInfo } = useAuth(); // Lo utilizo para obtener el id del usuario logeado y cargar en el formulario el emisor.
  
  
  useEffect(() => {
    getTipoRequerimiento();
    getEstados();
    getPrioridades();
    getUsuarios();
    getRequerimientos();
  }, []);

  // Obtiene las categorias segun el tipo de requerimiento que se haya seleccionado
  useEffect(() => {
    if (formData.tipo) {
      const tipoSeleccionado = tipos.find((tipo) => tipo.id === formData.tipo);
      setFilteredCategorias(tipoSeleccionado ? tipoSeleccionado.categorias : []); // Obtén las categorías del tipo seleccionado
      setFormData((prev) => ({ ...prev, categoria: "" })); // Reinicia la categoría seleccionada
    } else {
      setFilteredCategorias([]); // Si no hay tipo seleccionado, vacía las categorías
    }
  }, [formData.tipo, tipos]);

  // Consulto a la BD el ultimo registro insertado (segun el tipoRequerimiendoId) para armar el codigo secuencial a crear.
  useEffect(() => {
    const fetchCodigo = async () => {
        if (formData.tipo) {
          try {
            const secuencial = await getUltimoSecuencial(formData.tipo); // Llama al backend y me devuelve DIRECTAMENTE el siguiente número a insertar (NO EL ULTIMO INSERTADO).
            if (secuencial !== null) {
              const anio = new Date().getFullYear(); // Obtiene el año actual
              const tipoSeleccionado = tipos.find((tipo) => tipo.id === formData.tipo); // Encuentra el tipo
              const codigoGenerado = `${tipoSeleccionado?.codigo}-${anio}-${String(secuencial).padStart(10, "0")}`; // Genera el código
              // padStart es una forma de formatear números (en este caso, secuencial) para que siempre tengan una longitud específica (10 caracteres), rellenando con ceros al principio si es necesario.
              setFormData((prev) => ({ ...prev, codigo: codigoGenerado })); // Actualiza el estado
            }
          } catch (error) {
            console.error("Error al generar el código:", error);
          }
        } else {
          setFormData((prev) => ({ ...prev, codigo: "" })); // Si no hay tipo, limpia el código
        }
      };
  
    fetchCodigo();
  }, [formData.tipo, tipos]);

  // Limpia el código si el tipo de rerquerimiento cambia a un valor vacío
  useEffect(() => {
    if (!formData.tipo) {
      setFormData((prev) => ({ ...prev, codigo: "" })); // Limpia el código si no hay tipo
    }
  }, [formData.tipo]);
  
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
  
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + formData.archivosAdjuntos.length > 5) {
      setErrors({ ...errors, archivosAdjuntos: "Máximo 5 archivos permitidos." });
      return;
    }
    setFormData({
      ...formData,
      archivosAdjuntos: [...formData.archivosAdjuntos, ...files],
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.codigo.trim()) newErrors.codigo = "El código es obligatorio.";
    if (!formData.prioridad) newErrors.prioridad = "Debe seleccionar una prioridad.";
    if (!formData.tipo) newErrors.tipo = "Debe seleccionar un tipo.";
    if (!formData.estado) newErrors.estado = "Debe seleccionar un estado.";
    if (!formData.asunto.trim()) newErrors.asunto = "El asunto es obligatorio.";
    if (!formData.descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria.";
    if (!formData.categoria) newErrors.categoria = "Debe seleccionar una categoría.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const tipoRequerimiento = tipos.find((tipo) => tipo.id === formData.tipo);
      const estadoRequerimiento = estados.find((estado) => estado.id === formData.estado);
      const prioridadRequerimiento = prioridades.find((prioridad) => prioridad.id === formData.prioridad);
  
      // Crear el objeto de datos del requerimiento
      const dataToSave = {
        codigo: formData.codigo,
        fechaHoraAlta: new Date().toISOString(),
        asunto: formData.asunto,
        descripcion: formData.descripcion,
        tipoRequerimientoId: formData.tipo,
        estadoRequerimientoId: formData.estado,
        prioridadRequerimientoId: formData.prioridad,
        emisorLegajo: userInfo?.legajo,
        destinatarioId: formData.destinatario || null,
        requerimientosRelacionadosCodigos: formData.requerimientosVinculados.map(req => req.codigo), //IDs para vincular con los requerimientos
      };
  
      // Crear un objeto FormData
      const formDataToSend = new FormData();
  
      // Agregar los datos del requerimiento en formato JSON
      formDataToSend.append("requerimiento", new Blob([JSON.stringify(dataToSave)], { type: "application/json" }));
  
      // Agregar los archivos adjuntos si hay
      if (formData.archivosAdjuntos && formData.archivosAdjuntos.length > 0) {
        formData.archivosAdjuntos.forEach((file) => {
          formDataToSend.append("archivos", file);
        });
      }
  
      // Llamar a la función de guardado con el FormData
      if (onSave) {
        onSave(formDataToSend);
      }
      
      onCancel(); // Cierra el formulario después de guardar
    }
  };
  
  return (
    <Box sx={{ mt: 2 }}>
      {/* 1. Tipo de Requerimiento */}
      <FormControl fullWidth margin="normal" error={!!errors.tipo}>
        <InputLabel>Tipo de Requerimiento</InputLabel>
        <Select value={formData.tipo} onChange={handleChange("tipo")}>
          {(Array.isArray(tipos) ? tipos : []).map((tipo) => (
            <MenuItem key={tipo.id} value={tipo.id}>
              {tipo.descripcion}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{errors.tipo}</FormHelperText>
      </FormControl>

      {/* 2. Categoría */}
      <FormControl fullWidth margin="normal" error={!!errors.categoria}>
        <InputLabel>Categoría</InputLabel>
        <Select
          value={formData.categoria}
          onChange={handleChange("categoria")}
          disabled={!filteredCategorias.length} // Desactiva si no hay categorías filtradas
        >
          {filteredCategorias.map((categoria) => (
            <MenuItem key={categoria.id} value={categoria.id}>
              {categoria.descripcion}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{errors.categoria}</FormHelperText>
      </FormControl>

      {/* 3. Código */}
      <TextField
        label="Código"
        fullWidth
        value={formData.codigo}
        disabled // Deshabilitado para que no sea editable
        margin="normal"
        error={!!errors.codigo}
        helperText={errors.codigo}
      />

      {/* 4. Prioridad */}
      <FormControl fullWidth margin="normal" error={!!errors.prioridad}>
        <InputLabel>Prioridad</InputLabel>
        <Select value={formData.prioridad} onChange={handleChange("prioridad")}>
          {prioridades.map((prioridad) => (
            <MenuItem key={prioridad.id} value={prioridad.id}>
              {prioridad.nombre}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{errors.prioridad}</FormHelperText>
      </FormControl>

      {/* 5. Asunto */}
      <TextField
        label="Asunto"
        fullWidth
        value={formData.asunto}
        onChange={handleChange("asunto")}
        margin="normal"
        error={!!errors.asunto}
        helperText={errors.asunto || `Máximo 50 caracteres (${formData.asunto.length}/50)`}
      />

      {/* 6. Descripción */}
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

      {/* 7. Destinatario */}
      <FormControl fullWidth margin="normal">
        <Autocomplete
          options={[{ legajo: null, nombre: "Sin destinatario", apellido: "" }, ...usuarios]}
          getOptionLabel={(option) =>
            option?.legajo === null ? "Sin destinatario" : `${option.nombre} ${option.apellido}`
          }
          value={usuarios.find((user) => user.legajo === formData.destinatario) || null}
          onChange={(event, newValue) => {
            const nuevoEstado = newValue?.legajo
              ? estados.find((estado) => estado.nombre === "Asignado")?.id
              : estados.find((estado) => estado.nombre === "Abierto")?.id;

            setFormData({
              ...formData,
              destinatario: newValue?.legajo || null,
              estado: nuevoEstado || "",
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
            // 🔥 Extraemos key y pasamos el resto de props
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

      {/* 8. Estado */}
      <FormControl fullWidth margin="normal" error={!!errors.estado}>
      <InputLabel>Estado</InputLabel>
      <Select
        value={formData.estado}
        onChange={(e) => {
          const nuevoEstadoId = e.target.value;
          const estadoSeleccionado = estados.find(
            (estado) => estado.id === nuevoEstadoId
          );

          // Validar si se intenta cambiar de "Asignado" a "Abierto" con un destinatario seleccionado
          if (
            estadoSeleccionado?.nombre === "Abierto" &&
            formData.estado === estados.find((estado) => estado.nombre === "Asignado")?.id &&
            formData.destinatario
          ) {
            setErrors({
              ...errors,
              estado: "No puede cambiar a 'Abierto' mientras hay un destinatario seleccionado.",
            });

            // Borrar el error después de 3 segundos
            setTimeout(() => {
              setErrors((prevErrors) => ({
                ...prevErrors,
                estado: "", // Limpiar solo el error de estado
              }));
            }, 3000); // 3000ms = 3 segundos

            return; // Detener el cambio de estado
          }

          // Validar si se intenta asignar "Asignado" sin destinatario
          if (estadoSeleccionado?.nombre === "Asignado" && !formData.destinatario) {
            setErrors({
              ...errors,
              estado: "Debe seleccionar un destinatario antes de asignar.",
            });

            // Borrar el error después de 3 segundos
            setTimeout(() => {
              setErrors((prevErrors) => ({
                ...prevErrors,
                estado: "", // Limpiar solo el error de estado
              }));
            }, 3000);

            // Prevenir que el estado cambie
            setFormData({
              ...formData,
              estado: estados.find((estado) => estado.nombre === "Abierto")?.id || "", // Revertir a "Abierto"
            });

            return; // Detener el cambio de estado
          }

          // Actualizar el estado y limpiar errores
          setFormData({
            ...formData,
            estado: nuevoEstadoId,
          });

          // Limpiar los errores si todo es válido
          setErrors({
            ...errors,
            estado: "",
          });
        }}
      >
        {estados.map((estado) => (
          <MenuItem key={estado.id} value={estado.id}>
            {estado.nombre}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>{errors.estado}</FormHelperText>
      </FormControl>

      {/* 9. Archivos Adjuntos */}
      <Button variant="contained" component="label">
        Subir Archivos (Opcional)
        <input
          type="file"
          hidden
          multiple
          accept=".doc,.docx,.pdf,.xls,.xlsx" // Se agregó accept=".doc,.docx,.pdf,.xls,.xlsx" en el <input>. Esto evita que el usuario seleccione otros tipos de archivos desde el explorador.
          onChange={(event) => {
            const files = Array.from(event.target.files); // Convertimos archivos en array
            const archivosExistentes = formData.archivosAdjuntos || [];

            // Definir formatos permitidos
            const formatosPermitidos = [
              "application/pdf", 
              "application/msword", // .doc
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
              "application/vnd.ms-excel", // .xls
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // .xlsx
            ];

            // Filtrar archivos por formato permitido
            const archivosValidos = files.filter(file => formatosPermitidos.includes(file.type));

            // Mostrar error si hay archivos no permitidos
            if (archivosValidos.length < files.length) {
              setErrors((prevErrors) => ({
                ...prevErrors,
                archivosAdjuntos: "Solo se permiten archivos Word, PDF o Excel.",
              }));
              return;
            }

            // Validar cantidad máxima de archivos
            if (archivosValidos.length + archivosExistentes.length > 5) {
              setErrors((prevErrors) => ({
                ...prevErrors,
                archivosAdjuntos: "Máximo 5 archivos permitidos.",
              }));
              return;
            }

            // Validar archivos duplicados
            const nuevosArchivos = archivosValidos.filter(
              (file) => !archivosExistentes.some((a) => a.name === file.name)
            );

            if (nuevosArchivos.length < archivosValidos.length) {
              setErrors((prevErrors) => ({
                ...prevErrors,
                archivosAdjuntos: "Algunos archivos ya fueron agregados.",
              }));
            } else {
              setErrors((prevErrors) => ({ ...prevErrors, archivosAdjuntos: "" }));
            }

            // Agregar los archivos seleccionados al estado
            setFormData((prev) => ({
              ...prev,
              archivosAdjuntos: [...archivosExistentes, ...nuevosArchivos],
            }));

            // Limpiar el input para permitir cargar el mismo archivo nuevamente
            event.target.value = null;
          }}
          />
      </Button>

      {/* Mostrar errores */}
      {errors.archivosAdjuntos && <FormHelperText error>{errors.archivosAdjuntos}</FormHelperText>}

      {/* Vista previa uniforme de los archivos */}
      {formData.archivosAdjuntos && formData.archivosAdjuntos.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <strong>Archivos Adjuntos:</strong>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              {formData.archivosAdjuntos.map((file, index) => (
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
                    {/* Ícono de archivo */}
                    <InsertDriveFile color="primary" />

                    {/* Información del archivo */}
                    <Box>
                      <div style={{ fontWeight: "bold" }}>{file.name}</div>
                      <div style={{ fontSize: "0.85em", color: "#757575" }}>
                        {(file.size / 1024).toFixed(2)} KB
                      </div>
                    </Box>
                  </Box>

                  {/* Botón para eliminar archivo */}
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      const nuevosArchivos = formData.archivosAdjuntos.filter(
                        (_, i) => i !== index
                      );
                      setFormData({
                        ...formData,
                        archivosAdjuntos: nuevosArchivos,
                      });
                    }}
                  >
                    Quitar
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
      )}
      
      {/* 10. Vincular con otros requerimientos */}
      <FormControl fullWidth margin="normal">
        <Autocomplete
          multiple
          options={requerimientos.filter(
            (req) => !(formData.requerimientosVinculados || []).some((rel) => rel.codigo === req.codigo)
          )} // Filtra los requerimientos ya seleccionados
          getOptionLabel={(option) => `${option.codigo} - ${option.descripcion}`}
          value={formData.requerimientosVinculados || []}
          onChange={(event, newValue) => {
            setFormData({
              ...formData,
              requerimientosVinculados: newValue, // Actualiza los requerimientos vinculados
            });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Vincular con otro Requerimiento (opcional)"
              placeholder="Buscar por código o descripción"
              margin="normal"
            />
          )}
        />
      </FormControl>

      {/* 11. Botones de acción */}
      <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 3 }}>
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

export default FormularioCrearRequerimiento;
