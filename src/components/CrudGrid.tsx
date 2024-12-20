import React, { useState } from 'react';
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

interface CrudGridProps {
  columns: GridColDef[];
  initialRows: any[];
  entityName: string; // Nombre de la entidad para los mensajes
}

export const CrudGrid: React.FC<CrudGridProps> = ({ columns, initialRows, entityName }) => {
  const [rows, setRows] = useState(initialRows);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [isEditable, setIsEditable] = useState(false); // Para habilitar edición en el pop-up de visualización

  const handleDeleteClick = (row: any) => {
    setSelectedRow(row);
    setOpenDeleteDialog(true);
  };

  const handleEditClick = (row: any) => {
    setSelectedRow(row);
    setOpenEditDialog(true);
  };

  const handleViewClick = (row: any) => {
    setSelectedRow(row);
    setOpenViewDialog(true);
    setIsEditable(false); // Comienza en modo solo lectura
  };

  const handleConfirmDelete = () => {
    setRows(rows.filter((row) => row.id !== selectedRow.id));
    setOpenDeleteDialog(false);
  };

  const handleEditSubmit = () => {
    setRows(rows.map((row) => (row.id === selectedRow.id ? selectedRow : row)));
    setOpenEditDialog(false);
    setOpenViewDialog(false);
  };

  const handleFieldChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRow({ ...selectedRow, [field]: event.target.value });
  };

  return (
    <Box sx={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={rows}
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
                onClick={() => handleEditClick(params.row)}
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
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          Estás seguro que desea eliminar {entityName} "{selectedRow?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para editar */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Editar {entityName}</DialogTitle>
        <DialogContent>
          {columns
            .filter((col) => col.field !== 'actions') // No incluir la columna de acciones
            .map((col) => (
              <TextField
                key={col.field}
                margin="dense"
                label={col.headerName}
                fullWidth
                type={col.type === 'number' ? 'number' : 'text'}
                value={selectedRow?.[col.field] || ''}
                onChange={handleFieldChange(col.field)}
              />
            ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button onClick={handleEditSubmit} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para visualizar */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)}>
        <DialogTitle>Ver {entityName}</DialogTitle>
        <DialogContent>
          {columns
            .filter((col) => col.field !== 'actions') // No incluir la columna de acciones
            .map((col) => (
              <TextField
                key={col.field}
                margin="dense"
                label={col.headerName}
                fullWidth
                type={col.type === 'number' ? 'number' : 'text'}
                value={selectedRow?.[col.field] || ''}
                onChange={handleFieldChange(col.field)}
                InputProps={{
                  readOnly: !isEditable, // Solo editable si `isEditable` es true
                }}
              />
            ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Salir</Button>
          <Button
            onClick={() => setIsEditable(true)}
            color="primary"
            disabled={isEditable} // Desactivar si ya está en modo editable
          >
            Editar
          </Button>
          {isEditable && (
            <Button onClick={handleEditSubmit} color="primary">
              Guardar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
