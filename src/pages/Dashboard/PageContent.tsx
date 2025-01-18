import React from 'react';
import { Box, Typography } from '@mui/material';
import Usuarios from '../Usuario/PageUsuario';
import Requerimientos from '../Requerimiento/PageRequerimiento';

interface PageContentProps {
  pathname: string;
}

const pageComponents: { [key: string]: React.ReactNode } = {
  '/usuarios': <Usuarios />,
  '/requerimientos': <Requerimientos />,
  // Agrega más rutas y componentes aquí según sea necesario
};

export const PageContent: React.FC<PageContentProps> = ({ pathname }) => {
  const renderContent = pageComponents[pathname] || (
    <><Typography variant="h2">Bienvenido al Dashboard</Typography><Typography variant="body1">Acá podes administrar tu aplicación.</Typography></>
    
  );

  return (
    <Box sx={{ p: 3 }}>
      {renderContent}
    </Box>
  );
};