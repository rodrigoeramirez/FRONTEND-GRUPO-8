import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
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
import { useUsuario } from '../../context/UsuarioContext';
import Swal from 'sweetalert2';
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from '@mui/material/Typography';

interface CrudGridProps {
  columns: GridColDef[];
  initialRows: any[];
  entityName: string; // Nombre de la entidad para los mensajes
  onEdit: (id: string) => void; // Define el tipo de la función
}

export const TablaUsuario: React.FC<CrudGridProps> = ({ columns, initialRows, entityName, onEdit }) => {
  const [rows, setRows] = useState(initialRows);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [isEditable, setIsEditable] = useState(false); // Para habilitar edición en el pop-up de visualización
  const [searchValue, setSearchValue] = useState(""); // Valor del buscador
  const [filteredRows, setFilteredRows] = useState(initialRows); // Filas filtradas
  const { deleteUsuario } = useUsuario();

  //Para que cuando se recargue la página muestre los datos.
  useEffect(() => {
    setRows(initialRows);
    setFilteredRows(initialRows);
  }, [initialRows]);

  // Filtrar las filas según el valor del buscador
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchValue(value);
    const filtered = rows.filter((row) => {
      const fullName = `${row.nombre} ${row.apellido}`.toLowerCase();
      return (
        row.legajo.toString().includes(value) ||
        row.nombre.toLowerCase().includes(value) ||
        row.apellido.toLowerCase().includes(value) ||
        fullName.includes(value)
      );
    });
    setFilteredRows(filtered);
  };

  const handleDeleteClick = (row: any) => {
    setSelectedRow(row);
    setOpenDeleteDialog(true);
  };

  const handleViewClick = (row: any) => {
    setSelectedRow(row);
    setOpenViewDialog(true);
    setIsEditable(false); // Comienza en modo solo lectura
  };

  const handleConfirmDelete = async () => {
    setRows(rows.filter((row) => row.id !== selectedRow.id));
    try {
      const resp = await deleteUsuario(selectedRow.legajo);
      if (resp) {
        // Actualiza `rows` y `filteredRows`
        const updatedRows = rows.filter((row) => row.id !== selectedRow.id);
        setRows(updatedRows);
        setFilteredRows(updatedRows); // Refleja los datos actualizados
        setOpenDeleteDialog(false);
        Swal.fire({
          icon: 'success',
          title: 'Eliminación Exitosa',
          text: 'El usuario ha sido eliminado correctamente del sistema.',
          confirmButtonText: 'Aceptar'
        });

      } else {
        Swal.fire("Error", "Hubo un problema con la eliminación.", "error");
      }

    } catch (error) {
      console.error("Failed to delete: ", error);
    }
  };

  return (
    <Box sx={{ height: 500, width: "100%" }}>
      <TextField
        placeholder="Buscar por nombre, apellido o legajo..."
        fullWidth
        value={searchValue}
        onChange={handleSearch}
        sx={{ mb: 2 }}
      />

      {filteredRows.length > 0 ? (
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
                  onClick={() => onEdit(params.row.legajo)}
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
      ) : (
        // Mensaje cuando no hay coincidencias en la búsqueda
        <Typography color="error" sx={{ mt: 2, textAlign: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
          No se encontraron coincidencias con la búsqueda.
        </Typography>
      )}

      {/* Diálogo para confirmar eliminación */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1976d2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          ¿Estás seguro de que deseas eliminar a "{selectedRow?.nombre} {selectedRow?.apellido}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para visualizar */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)}>
        <DialogTitle sx={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1976d2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Datos de Usuario
          <IconButton onClick={() => setOpenViewDialog(false)} sx={{ color: "#1976d2" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
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
                  readOnly: true, // Siempre en modo solo lectura
                  style: {
                    backgroundColor: '#f0f0f0', // Fondo gris claro
                    color: '#777', // Texto gris oscuro
                  },
                }}
              />
            ))}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
