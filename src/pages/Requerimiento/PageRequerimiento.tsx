import { TablaRequerimiento } from './TablaRequerimiento';
import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useRequerimiento, RequerimientoProvider } from '../../context/RequerimientoContext';
import { useTipoRequerimiento } from '../../context/TipoRequerimientoContext';
import Swal from 'sweetalert2';
import {Chip} from "@mui/material"
import { TipoRequerimientoProvider } from '../../context/TipoRequerimientoContext';
import { useEstado } from '../../context/EstadoContext';
import { PrioridadProvider } from '../../context/PrioridadContext';
import { EstadoProvider } from '../../context/EstadoContext';
import { CategoriaRequerimientoProvider } from '../../context/CategoriaRequerimientoContext';
import { AuthProvider } from '../../context/AuthContext';
import { ArchivoAdjuntoProvider } from '../../context/ArchivoAdjuntoContext';
import { ComentarioRequerimientoProvider } from '../../context/ComentarioRequerimientoContext';
import FormularioCrearRequerimiento from './FormularioCrearRequerimiento';
import FormularioEditarRequerimiento from './FormularioEditarRequerimiento';

// Acá defino las columnas para la tabla de requerimientos.
const columns = [
    { field: 'codigo', headerName: 'Código', flex: 1 },
    {
      field: 'prioridad',
      headerName: 'Prioridad',
      flex: 1.2,
      renderCell: (params) => params.row.prioridad || 'Sin prioridad', // Ya usamos prioridadRequerimientoNombre
    },
    {
      field: 'tipo',
      headerName: 'Tipo',
      flex: 1.2,
      renderCell: (params) => params.row.tipo || 'Sin tipo', // Ya usamos tipoRequerimientoDescripcion
    },
    {
      field: 'categoria',
      headerName: 'Categoría',
      flex: 1.5,
      renderCell: (params) => params.row.categoria || 'Sin categoría', // Ya mapeamos correctamente categoría
    },
    {
      field: 'fecha',
      headerName: 'Fecha',
      flex: 1.2,
      renderCell: (params) =>
        new Date(params.row.fecha).toLocaleDateString('es-ES') || 'Sin fecha',
    },
    {
        field: 'estado',
        headerName: 'Estado',
        flex: 1.5,
        renderCell: (params) => {
          let color = 'default';
          switch (params.row.estado) {
            case 'Abierto':
              color = 'error'; // Rojo
              break;
            case 'Asignado':
              color = 'primary'; // Azul
              break;
            case 'Resuelto':
              color = 'success'; // Verde
              break;
            case 'Reabierto':
              color = 'warning'; // Naranja
              break;
            case 'Cerrado':
              color = 'default'; // Gris
              break;
            default:
              color = 'default'; // Predeterminado (gris)
          }
      
          return (
            <Chip
              label={params.row.estado || 'Sin estado'}
              color={color}
              variant="outlined" // Opcional: agrega un borde
              style={{
                fontWeight: 'bold',
                fontSize: '0.9rem',
              }}
            />
          );
        },
      }
      ,
    {
      field: 'propietario',
      headerName: 'Propietario',
      flex: 1.5,
      renderCell: (params) => params.row.propietario || 'Sin propietario', // Ya mapeamos propietario
    },
    { field: 'asunto', headerName: 'Asunto', flex: 2 }, // Espacio para textos largos
  ]; 

const PageRequerimiento = () => {
  const [rows, setRows] = useState<any[]>([]); // Estado para las filas de requerimientos.
  const [loading, setLoading] = useState(true); // Estado para el indicador de carga.
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores.
  const [openEditDialog, setOpenEditDialog] = useState(false); // Controla el diálogo de edición.
  const [openCrearDialog, setOpenCrearDialog] = useState(false); // Controla el dialogo de edición.
  const [selectedRequerimiento, setSelectedRequerimiento] = useState<any | null>(null); // Requerimiento seleccionado para editar.
  const { requerimientos, getRequerimientos, createRequerimiento, updateRequerimiento } = useRequerimiento(); // Funciones del contexto de requerimientos.
  const [filteredCategorias, setFilteredCategorias] = useState([]); // Se usa para filtrar las categorias segun el tipo de requerimiento.
  const { tipos, getTipoRequerimiento } = useTipoRequerimiento();
  const { estados, getEstados } = useEstado();
  
  {/*Esto es para almacenar los valores de los filtros.*/}
  const [filtroFecha, setFiltroFecha] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string | null>(null);

  // Con esto obtengo todos los requerimientos, tiposRequerimiento desde la BD.
  useEffect(() => {
    getRequerimientos();
    getTipoRequerimiento();
    getEstados(); 
  }, []);

  // Obtiene las categorias segun el tipo de requerimiento que se haya seleccionado
  useEffect(() => {
    if (filtroTipo) {
      const tipoSeleccionado = tipos.find((tipo) => tipo.descripcion === filtroTipo);
      setFilteredCategorias(tipoSeleccionado ? tipoSeleccionado.categorias : []);
      setFiltroCategoria(null); // Resetear categoría cuando cambia el tipo
    } else {
      setFilteredCategorias([]);
    }
  }, [filtroTipo, tipos]);

  {/*Esto es para actualizar los valores de los filtros.*/}
  const handleFiltroFecha = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiltroFecha(event.target.value);
  };
  const handleFiltroTipo = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFiltroTipo(event.target.value as string);
    setFiltroCategoria(null); // Resetear categoría cuando cambia el tipo
  };
  const handleFiltroCategoria = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFiltroCategoria(event.target.value as string);
  };
  const handleFiltroEstado = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFiltroEstado(event.target.value as string);
  };

  {/*Funcion para aplicar los filtros a los datos.*/}
  const filtrarRequerimientos = (requerimientos) => {
    return requerimientos.filter((requerimiento) => {
      const cumpleFecha = !filtroFecha || requerimiento.fechaHoraAlta.includes(filtroFecha);
      const cumpleTipo = !filtroTipo || requerimiento.tipoRequerimientoDescripcion === filtroTipo;
      const cumpleCategoria = !filtroCategoria || requerimiento.categoriaRequerimientoDescripcion === filtroCategoria;
      const cumpleEstado = !filtroEstado || requerimiento.estadoRequerimientoNombre === filtroEstado;
  
      return cumpleFecha && cumpleTipo && cumpleCategoria && cumpleEstado;
    });
  };

  // Acá mapeo los requerimientos obtenidos de los filtros.
  useEffect(() => {
  const fetchData = () => {
    setLoading(true);
    setError(null);

    try {
      if (requerimientos.length > 0) {
        const requerimientosFiltrados = filtrarRequerimientos(requerimientos);

        const transformedRows = requerimientosFiltrados.map((item) => ({
          id: item.codigo,
          codigo: item.codigo,
          fecha: item.fechaHoraAlta,
          asunto: item.asunto,
          descripcion: item.descripcion,
          prioridad: item.prioridadRequerimientoNombre,
          tipo: item.tipoRequerimientoDescripcion,
          categoria: item.categoriaRequerimientoDescripcion || 'Sin categoría',
          estado: item.estadoRequerimientoNombre,
          propietario: item.nombreCompletoDestinatario || 'Sin propietario',
          emisor: item.emisorLegajo,
          nombreCompletoEmisor:item.nombreCompletoEmisor,
          destinatarioId: item.destinatarioId,
          archivosAdjuntos: item.archivosAdjuntos,
          comentarios: item.comentarios,
          requerimientosRelacionados: item.requerimientosRelacionados,
        }));

        setRows(transformedRows);
      }
    } catch (err) {
      setError((err as Error).message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [requerimientos, filtroFecha, filtroTipo, filtroCategoria, filtroEstado]);

  // Obtengo el id del requerimiento a editar, a traves de TablaRequerimiento. Cuando clickeo el lapiz en el componente ( TablaRequerimiento) me pasa por parametro el id que quiere editar a esta funcion.
  const handleEdit = (codigo: string) => {
    const requerimientoSeleccionado = requerimientos.find((req) => req.codigo === codigo) || null; // De todos los rquerimientos obtengo el que coincide con el "id", para proseguir a su edición.
    setSelectedRequerimiento(requerimientoSeleccionado);
    setOpenEditDialog(true);
  };

  // Guardar un requerimiento nuevo.
  const handleSaveRequerimientoNew = async (formData) => {
    try {
      // Enviar formData al backend usando la función createRequerimiento
      const response = await createRequerimiento(formData);
  
      if (response) {
        Swal.fire({
          icon: 'success',
          title: 'Requerimiento Creado',
          text: 'El requerimiento fue creado exitosamente.',
        });
        getRequerimientos(); // Refresca la lista de requerimientos
      } else {
        throw new Error("Error en la creación del requerimiento");
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el requerimiento.',
      });
      console.error(error);
    }
  };
  
  // Guardar los cambios en un requerimiento editado.
  const handleSaveRequerimientoEdited = async (data, codigo_requerimiento) => {
    try {
      const respUpdate = await updateRequerimiento(data, codigo_requerimiento);
      if (respUpdate) {
        Swal.fire({
          icon: 'success',
          title: 'Edición Exitosa',
          text: 'El requerimiento ha sido actualizado correctamente.',
          confirmButtonText: 'Aceptar',
        });
        getRequerimientos(); // Refresco la tabla de requerimientos para que se vean los cambios.
      } else {
        Swal.fire('Error', 'Hubo un problema con la edición.', 'error');
      }
    } catch (error) {
      console.error('Failed to edit:', error);
    }
  };

  return (
    <>
    {/*Boton nuevo requerimiento*/}
      <Box>
        <Typography variant="h4">Requerimientos</Typography>
        <Button variant="contained" onClick={() => setOpenCrearDialog(true)} sx={{mt:3}}>
          + Nuevo requerimiento
        </Button>
      </Box>

      {/*Filtros*/}
      <Box sx={{ mt:3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          label="Filtrar por fecha"
          type="date"
          value={filtroFecha || ""}
          onChange={handleFiltroFecha}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 200 }}
        />

        <FormControl sx={{ width: 200 }}>
          <InputLabel shrink>Tipo</InputLabel>
          <Select value={filtroTipo || ""} onChange={handleFiltroTipo}>
            <MenuItem value="">Todos</MenuItem>
            {tipos.map((tipo) => (
              <MenuItem key={tipo.id} value={tipo.descripcion}>
                {tipo.descripcion}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ width: 200 }}>
          <InputLabel shrink>Categoría</InputLabel>
          <Select value={filtroCategoria || ""} onChange={handleFiltroCategoria} disabled={!filtroTipo}>
            <MenuItem value="">Todas</MenuItem>
            {filteredCategorias.map((categoria) => (
              <MenuItem key={categoria.id} value={categoria.descripcion}>
                {categoria.descripcion}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ width: 200 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={filtroEstado || ""} onChange={handleFiltroEstado}>
            <MenuItem value="">Todos</MenuItem>
            {estados.map((estado) => (
              <MenuItem key={estado.id} value={estado.nombre}>
                {estado.nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="outlined" onClick={() => {
          setFiltroFecha(null);
          setFiltroTipo(null);
          setFiltroCategoria(null);
          setFiltroEstado(null);
        }}>
          Limpiar Filtros
        </Button>
      </Box>

      <Box
        sx={{
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
        >
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">
            No se pudo cargar la información. Por favor, inténtelo de nuevo más tarde.
          </Typography>
        ) : rows.length === 0 ? (
          <Typography color="error" sx={{ mt: 2, textAlign: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
            No hay requerimientos que coincidan con los filtros seleccionados.
          </Typography>
        ) : (
          <AuthProvider>
            <ArchivoAdjuntoProvider>
              <ComentarioRequerimientoProvider>
                <TablaRequerimiento
                  columns={columns}
                  initialRows={rows}
                  entityName="Requerimientos"
                  onEdit={handleEdit}
                />
              </ComentarioRequerimientoProvider>
            </ArchivoAdjuntoProvider>
          </AuthProvider>
        )}
      </Box>

        {/*Dialog for create a new requirement */}
      <Dialog open={openCrearDialog} onClose={() => setOpenCrearDialog(false)}>
        <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1976d2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Nuevo Requerimiento
        </DialogTitle>
        <DialogContent>
          <RequerimientoProvider>
            <TipoRequerimientoProvider>
                <PrioridadProvider>
                    <EstadoProvider>
                        <CategoriaRequerimientoProvider>
                            <AuthProvider>
                            <FormularioCrearRequerimiento onCancel={() => setOpenCrearDialog(false)} onSave={handleSaveRequerimientoNew}></FormularioCrearRequerimiento>
                            </AuthProvider>
                        </CategoriaRequerimientoProvider>
                    </EstadoProvider>
                </PrioridadProvider>
            </TipoRequerimientoProvider>
          </RequerimientoProvider>
        </DialogContent>
      </Dialog>

      {/* Dialog for edit a requirement */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="lg">
        <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1976d2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Editar Requerimiento
        </DialogTitle>
        <DialogContent>
          <AuthProvider>
          <ComentarioRequerimientoProvider>
          <RequerimientoProvider>
            <TipoRequerimientoProvider>
                <PrioridadProvider>
                    <EstadoProvider>
                      <ArchivoAdjuntoProvider>
                      <CategoriaRequerimientoProvider>
                            <AuthProvider>
                            <FormularioEditarRequerimiento requerimiento={selectedRequerimiento} onCancel={() => setOpenEditDialog(false)} onSave={handleSaveRequerimientoEdited}></FormularioEditarRequerimiento>
                            </AuthProvider>
                        </CategoriaRequerimientoProvider>
                      </ArchivoAdjuntoProvider>                
                    </EstadoProvider>
                </PrioridadProvider>
            </TipoRequerimientoProvider>
          </RequerimientoProvider>
          </ComentarioRequerimientoProvider>
          </AuthProvider>
          
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PageRequerimiento;
