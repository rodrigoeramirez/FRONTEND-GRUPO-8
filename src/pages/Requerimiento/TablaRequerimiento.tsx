import React, { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useRequerimiento } from '../../context/RequerimientoContext';
import Swal from 'sweetalert2';
import { useArchivoAdjunto } from "../../context/ArchivoAdjuntoContext.tsx";
import { useComentarioRequerimiento } from '../../context/ComentarioRequerimientoContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography, Grid, Card } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import LinkIcon from '@mui/icons-material/Link';
import CommentIcon from '@mui/icons-material/Comment';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";



interface CrudGridProps {
  columns: GridColDef[];
  initialRows: any[];
  entityName: string; // Nombre de la entidad para los mensajes
  onEdit: (id: string) => void; // Función para manejar la edición
}

export const TablaRequerimiento: React.FC<CrudGridProps> = ({ columns, initialRows, entityName, onEdit }) => {
  const [rows, setRows] = useState(initialRows);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [filteredRows, setFilteredRows] = useState(initialRows);
  const [nuevoComentario, setNuevoComentario] = useState({asunto: "", descripcion: "", archivosAdjuntos: [],});
  
  
  const { deleteRequerimiento } = useRequerimiento(); // Función del contexto de requerimientos
  const { getArchivoAdjunto } = useArchivoAdjunto();
  const {comentarios, getComentariosByRequerimiento, createComentarioRequerimiento} = useComentarioRequerimiento();
  const { userInfo } = useAuth(); // Lo utilizo para obtener el id del usuario logeado y cargar en el formulario el emisor.

  // Filtro y ordeno los requerimientos de la tabla en forma descendente por FECHA.
  useEffect(() => {
  const sortedRows = [...initialRows].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  setRows(sortedRows);
  setFilteredRows(sortedRows);
}, [initialRows]);


  // Obtengo los comentarios del requerimiento seleccionado.
  useEffect(() => {
    if (selectedRow?.codigo) {
      getComentariosByRequerimiento(selectedRow.codigo);
    }
  }, [selectedRow]); // Se ejecuta cuando cambia el requerimiento seleccionado.

  // Funcion para agregar un comentario
  const handleAgregarComentario = async () => {
    if (!nuevoComentario.asunto || !nuevoComentario.descripcion) {
        alert("El asunto y la descripción no pueden estar vacíos.");
        return;
    }

    const formData = new FormData();

    // Crear objeto de comentario
    const comentarioData = {
        requerimientoCodigo: selectedRow.codigo,
        usuarioEmisorId: userInfo?.legajo,
        asunto: nuevoComentario.asunto,
        descripcion: nuevoComentario.descripcion,
        fechaHora: new Date().toISOString(),
    };

    // Convertir a JSON y agregarlo a FormData
    const comentarioBlob = new Blob([JSON.stringify(comentarioData)], { type: "application/json" });

    formData.append("comentario", comentarioBlob, "comentario.json");

    // Agregar archivos adjuntos si existen
    if (nuevoComentario.archivosAdjuntos.length > 0) {
        nuevoComentario.archivosAdjuntos.forEach((file, index) => {
            formData.append("archivos", file);
        });
    }

    // Verifico el contenido de FormData antes de enviarlo
    for (const [key, value] of formData.entries()) {
        console.log(`FormData key: ${key}, value:`, value);
    }

    try {
        const response = await createComentarioRequerimiento(formData);
        // Verifico la respuesta del servidor
        console.log("Respuesta del servidor:", response);

        getComentariosByRequerimiento(selectedRow.codigo);

        // Resetear el formulario después de agregar el comentario
        setNuevoComentario({ asunto: "", descripcion: "", archivosAdjuntos: [] });
    } catch (error) {
        console.error("Error al agregar comentario:", error);
    }
  };

  // Manejo de archivos adjuntos
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
  
    // Definir formatos permitidos
    const formatosPermitidos = [
      "application/pdf",
      "application/msword", // .doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    ];
  
    // Filtrar archivos por formato permitido
    const archivosValidos = files.filter((file) =>
      formatosPermitidos.includes(file.type)
    );
  
    // Mostrar error si hay archivos no permitidos
    if (archivosValidos.length < files.length) {
      alert("Solo se permiten archivos PDF, Word o Excel.");
      return;
    }
  
    // Limitar cantidad de archivos a 5
    if (archivosValidos.length + nuevoComentario.archivosAdjuntos.length > 5) {
      alert("Solo puedes adjuntar hasta 5 archivos.");
      return;
    }
  
    setNuevoComentario({
      ...nuevoComentario,
      archivosAdjuntos: [...nuevoComentario.archivosAdjuntos, ...archivosValidos],
    });
  };
  
  // Descarga el archivo adjunto con la ruta obtenida.
  const handleDescarga = async (ruta:string) => {
    await getArchivoAdjunto(ruta);
  };

  // Filtrar las filas según el valor del buscador
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchValue(value);
    const filtered = rows.filter((row) => {
      const fullName = `${row.codigo} ${row.asunto}`.toLowerCase();
      return (
        row.codigo.toLowerCase().includes(value) ||
        row.asunto.toLowerCase().includes(value) ||
        fullName.includes(value)
      );
    });
    setFilteredRows(filtered);
  };

  const handleDeleteClick = (row: any) => {
    setSelectedRow(row);
    setOpenDeleteDialog(true);

  };

  const handleConfirmDelete = async () => {
    try {
      const resp = await deleteRequerimiento(selectedRow.codigo);
      if (resp) {
        const updatedRows = rows.filter((row) => row.id !== selectedRow.id);
        setRows(updatedRows);
        setFilteredRows(updatedRows);
        setOpenDeleteDialog(false);
        Swal.fire({
          icon: 'success',
          title: 'Eliminación Exitosa',
          text: 'El requerimiento ha sido eliminado correctamente.',
          confirmButtonText: 'Aceptar',
        });
      } else {
        Swal.fire('Error', 'Hubo un problema con la eliminación.', 'error');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleViewClick = (row: any) => {
    setSelectedRow(row);
    setOpenViewDialog(true);
  };

  return (
    
    <Box sx={{ height: 500, width: '100%' }}>
      
      <TextField
        placeholder="Buscar por código o asunto..."
        fullWidth
        value={searchValue}
        onChange={handleSearch}
      />
      <DataGrid
        rows={filteredRows}
        columns={[
          ...columns,
          { 
            field: 'acciones',
            headerName: 'Acciones',
            type: 'actions',
            width: 200,
            getActions: (params) => [
              <GridActionsCellItem
                icon={<VisibilityIcon />}
                label="Ver"
                onClick={() => handleViewClick(params.row)}
              />,
              <GridActionsCellItem
                icon={<EditIcon />}
                label="Editar"
                onClick={() => onEdit(params.row.id)}
              />,
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Eliminar"
                onClick={() => handleDeleteClick(params.row)}
              />,
            ],
          },
        ]}
      />
     
      {/* Diálogo para confirmar eliminación */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
      <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1976d2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  Confirmar eliminación
  
</DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas eliminar el requerimiento "{selectedRow?.codigo}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para visualizar */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1976d2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  Detalles del Requerimiento
  <IconButton onClick={() => setOpenViewDialog(false)} sx={{ color: "#1976d2" }}>
    <CloseIcon />
  </IconButton>
</DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            {/* Columna izquierda */}
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, backgroundColor: "#fafafa" }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#333" }}>
                  Información General
                </Typography>
                {columns
                  .filter((col) => col.field !== 'acciones') // No incluir la columna de acciones
                  .map((col) => (
                    <TextField
                      key={col.field}
                      margin="dense"
                      label={col.headerName}
                      fullWidth
                      type={col.type === 'number' ? 'number' : 'text'}
                      value={selectedRow?.[col.field] || ''}
                      InputProps={{
                        readOnly: true,
                        style: {
                          backgroundColor: '#f0f0f0',
                          color: '#555',
                          borderRadius: "4px",
                        },
                      }}
                      sx={{ mb: 1.5 }}
                    />
                  ))}
              </Card>
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
                        Archivos Adjuntos ({selectedRow?.archivosAdjuntos?.length || 0})
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {selectedRow?.archivosAdjuntos && selectedRow.archivosAdjuntos.length > 0 ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {selectedRow.archivosAdjuntos.map((file, index) => (
                          <Card key={index} sx={{ p: 1.5, boxShadow: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <InsertDriveFileIcon color="primary" />
                                <Typography sx={{ fontWeight: "bold" }}>{file.nombreOriginal}</Typography>
                              </Box>
                              <Button
                                onClick={() => handleDescarga(file.ruta)}
                                sx={{ color: "#1976d2", fontWeight: "bold", textTransform: "none" }}
                              >
                                Descargar
                              </Button>
                            </Box>
                          </Card>
                        ))}
                      </Box>
                    ) : (
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
                        Requerimientos Relacionados ({selectedRow?.requerimientosRelacionados?.length || 0})
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {selectedRow?.requerimientosRelacionados && selectedRow.requerimientosRelacionados.length > 0 ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {selectedRow.requerimientosRelacionados.map((req, index) => (
                          <Card key={index} sx={{ p: 1.5, boxShadow: 1 }}>
                            <Typography sx={{ fontWeight: "bold" }}>{req.codigo} – {req.asunto}</Typography>
                            <Typography sx={{ color: "#555", mt: 1 }}>{req.descripcion}</Typography>
                            <Box sx={{ mt: 1, color: "#777" }}>
                              <Typography><strong>Estado:</strong> {req.estadoRequerimientoNombre}</Typography>
                              <Typography><strong>Prioridad:</strong> {req.prioridadRequerimientoNombre}</Typography>
                              <Typography>
                                <strong>Propietario:</strong> {req.nombreCompletoDestinatario || "Sin asignar"}
                              </Typography>
                            </Box>
                          </Card>
                        ))}
                      </Box>
                    ) : (
                      <Typography sx={{ color: "#757575", fontStyle: "italic" }}>
                        No posee requerimientos relacionados.
                      </Typography>
                    )}
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
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#1976d2" }} >
                      {comentario.username} - {comentario.fechaHora}
                    </Typography>
                    <Typography sx={{ fontWeight: "bold" }}>
                      {comentario.asunto}
                    </Typography>
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
                              mt: 1,
                              border: "1px solid #e0e0e0",
                              borderRadius: "4px",
                            }}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <InsertDriveFileIcon color="primary" />
                              <Typography>{file.nombreOriginal}</Typography>
                            </Box>
                            <Button
                              onClick={() => handleDescarga(file.ruta)}
                              sx={{ color: "#1976d2", fontWeight: "bold", textTransform: "none" }}
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

            {/* Sección para dejar un comentario */}
            {(selectedRow?.emisor === userInfo?.legajo || selectedRow?.destinatarioId === userInfo?.legajo || selectedRow?.estadoRequerimientoNombre === "Asignado" ) && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                  Dejar un comentario
                </Typography>

                {/* Campo para el asunto */}
                <TextField
                  fullWidth
                  label="Asunto"
                  variant="outlined"
                  size="small"
                  value={nuevoComentario.asunto}
                  onChange={(e) => setNuevoComentario({ ...nuevoComentario, asunto: e.target.value })}
                  sx={{ mb: 2 }}
                />

                {/* Campo para la descripción */}
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

                {/* Botón para subir archivos */}
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ mb: 2 }}
                >
                  Subir Archivos (Máx. 5)
                  <input
                    type="file"
                    hidden
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileChange}
                  />
                </Button>

                {/* Vista previa de archivos adjuntos */}
                {nuevoComentario.archivosAdjuntos.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                      Archivos Adjuntos:
                    </Typography>
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

                {/* Botón para agregar el comentario */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAgregarComentario}
                  sx={{ width: "100%" }}
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
        </DialogContent>
      </Dialog>
    </Box>
  );
};