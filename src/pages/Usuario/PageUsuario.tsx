import { TablaUsuario } from './TablaUsuario';
import { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useUsuario, UsuarioProvider } from "../../context/UsuarioContext";
import { CargoProvider } from '../../context/CargoContext';
import { DepartamentoProvider } from '../../context/DepartamentoContext';
import { Typography } from "@mui/material";
import FormularioCrearUsuario from './FormularioCrearUsuario';
import FormularioEditarUsuario from './FormularioEditarUsuario';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';

// Datos de las columnas a mostrar para la tabla Usuarios Empresa.
const columns = [
    { field: "nombre", headerName: "Nombre", width: 140 },
    { field: "apellido", headerName: "Apellido", width: 140 },
    { field: "username", headerName: "Username", width: 150 },
    { field: "email", headerName: "Correo Electrónico", width: 250 },
    { field: "legajo", headerName: "Legajo", width: 80 },
    { field: "cargo", headerName: "Cargo", width: 200 , renderCell: (params) => params.row.cargo.nombre},
    { field: "departamento", headerName: "Departamento", width: 200, renderCell: (params) => params.row.departamento.nombre },
  ];
const PageUsuario = () => {

  const [openCrearDialog, setOpenCrearDialog] = useState(false); // Lo utilizo para abrir el dialogo con el formulario Crear Usuario.

  interface Usuario {
    nombre: string;
    apellido: string;
    username: string;
    email: string;
    legajo: string;
    departamento: string;
    cargo: string;
  }

  const [rows, setRows] = useState<
    {
      id: string;
      nombre: string;
      apellido: string;
      username: string;
      email: string;
      legajo: string;
      cargo: string;
      departamento: string;
    }[]>([]); // Estado para las filas
  const [loading, setLoading] = useState(true); // Estado para el indicador de carga.
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores.
  const [openEditDialog, setOpenEditDialog] = useState(false); // Lo utilizo para abrir el dialogo con el formulario Editar.
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null); // Lo uso para buscar el espacio seleccionado a Editar.
  const {usuarios, getUsuarios, createUsuario,updateUsuario,} = useUsuario(); // Importo los metodos del usuarioContext para hacer las peticiones.
  const {userInfo}=useAuth();
  
  useEffect(() => {getUsuarios();},[]); // Obtengo los usuarios y los ejecuta solo una vez con [];
    
  // Mapeo los datos de usuarios obtenidos, a rows y los paso al componente para mostrarlo en el componente TablaUsuario.
  useEffect(() => {
        const fetchData = () => {
          setLoading(true);
          setError(null);
    
          try {
            if (usuarios.length > 0) {
              const transformedRows = usuarios.map((item: Usuario) => ({
                id: item.legajo,
                nombre: item.nombre,
                apellido: item.apellido,
                username: item.username.trim(),
                email: item.email,
                legajo: item.legajo,
                cargo: item.cargo,
                departamento: item.departamento,
              }));
              setRows(transformedRows); // Actualiza las filas transformadas
            }
          } catch (err) {
            setError((err as Error).message || "Ocurrió un error");
          } finally {
            setLoading(false);
          }
        };
    
        fetchData(); // Invoca a la funcion, cuando cambia usuarios, es decir, cuando se hace la peticion.
  }, [usuarios]); // Esto pertenece al hook useEffect. useEffect se utiliza para ejecutar código de forma "efectiva" en respuesta a cambios en las dependencias especificadas (en este caso, usuarios).

  console.log(usuarios); 

  // Funcion que se ejecuta al clickear el boton editar de la tabla. La orden viene directamente de TablaEspacio.
  const handleEdit = (legajo: string) => {
    const usuarioSeleccionado = usuarios.find((usuario) => usuario.legajo === legajo) || null;
    setSelectedUsuario(usuarioSeleccionado); // Asegura que nunca sea undefined
    setOpenEditDialog(true); // Abre el diálogo para editar el usuario
    //console.log(usuarioSeleccionado); //
  };
  
  // Funcion que se ejecuta al apretar el boton guardar de crear usuario.
  const handleSaveUserNew = async (data) => {
    try {
        const respCreate = await createUsuario(data);
        if (respCreate) {
          Swal.fire({
            icon: 'success',
            title: 'Registro Exitoso',
            text: 'Se ha enviado una clave temporal de acceso al correo electrónico del usuario.',
            confirmButtonText: 'Aceptar'
          });
          getUsuarios(); // Actualizo la tabla con el usuario recien creado.
        } else {
            
            Swal.fire(`Error: "Hubo un problema con el registro."}`, "error");
        }
    } catch (error) {
        console.error("Failed to create: ", error);
    }
    
};

const handleSaveUserEdited = async (data, legajo, usernameViejo) => {
  try {
      const respUpdate = await updateUsuario(data, legajo);
      
      if (respUpdate) {
          const usuarioActual = userInfo?.sub; // Username de la sesión actual
          const nuevoUsername = data.username; // Nuevo username ingresado

          // Solo forzar logout si el usuario actual modificó su propio username
          if (usuarioActual === usernameViejo && nuevoUsername !== usernameViejo) {
              Swal.fire({
                  icon: "success",
                  title: "Usuario actualizado",
                  text: "Tu nombre de usuario ha sido cambiado. Por favor, vuelve a iniciar sesión.",
                  confirmButtonText: "Aceptar",
              }).then(() => {
                  localStorage.removeItem("token"); // Elimina el token
                  localStorage.removeItem("usuario"); // Elimina la info del usuario
                  window.location.href = ""; //  Redirigir manualmente al login
              });
          } else {
              // Si no editó su username, solo mostrar mensaje de éxito
              Swal.fire({
                  icon: "success",
                  title: "Edición Exitosa",
                  text: "Los datos del usuario han sido actualizados correctamente.",
                  confirmButtonText: "Aceptar",
              });
          }

          getUsuarios(); // Actualizo la tabla con los cambios
      } else {
          Swal.fire("Error", "Hubo un problema con la edición.", "error");
      }
  } catch (error) {
      console.error("Failed to edit: ", error);
  }
};





  return (
        <><><Box>
      <Typography variant="h4">Usuarios de Empresa</Typography>
      <Button variant="contained" onClick={() => setOpenCrearDialog(true)}>+ Nuevo usuario</Button>
    </Box><Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
        {loading ? (
          <CircularProgress /> // Indicador de carga
        ) : error ? (
          <Typography color="error">{error}</Typography> // Mensaje de error
        ) : columns.length > 0 && rows.length > 0 ? (
          <TablaUsuario
            columns={columns}
            initialRows={rows}
            entityName="Usuarios Empresa"
            onEdit={handleEdit}
          />
        ) : (
          <Typography color="error">
            No se pudo cargar la información. Por favor, inténtelo de nuevo más tarde.
          </Typography>
        )}
      {/*Dialogo para crear usuario */}
      </Box></><Dialog open={openCrearDialog} onClose={() => setOpenCrearDialog(false)}>
      <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1976d2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  Nuevo Usuario
  
</DialogTitle>
        <DialogContent>
          <UsuarioProvider>
            <CargoProvider>
              <DepartamentoProvider>
                <FormularioCrearUsuario onCancel={() => setOpenCrearDialog(false)} onSave={handleSaveUserNew} />
              </DepartamentoProvider>
            </CargoProvider>
          </UsuarioProvider>
        </DialogContent>
      </Dialog>
      {/*Dialogo para editar usuario */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
      <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1976d2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  Editar Usuario
  
</DialogTitle>
        <DialogContent>
        
        <UsuarioProvider>
            <CargoProvider>
              <DepartamentoProvider>
                <FormularioEditarUsuario usuario={selectedUsuario} onCancel={() => setOpenEditDialog(false)} onSave={handleSaveUserEdited} />
              </DepartamentoProvider>
            </CargoProvider>
          </UsuarioProvider>
        
        </DialogContent>
      </Dialog></>
      
  );
}

export default PageUsuario;