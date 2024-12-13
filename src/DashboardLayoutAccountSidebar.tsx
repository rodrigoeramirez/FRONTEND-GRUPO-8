import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import ListAlt from '@mui/icons-material/ListAlt';
import PeopleAlt from '@mui/icons-material/PeopleAlt';
import { AppProvider } from '@toolpad/core/AppProvider';
import  {CrudGrid}  from "./CrudGrid"; // Importa tu componente CrudGrid
import { DashboardLayout, SidebarFooterProps } from '@toolpad/core/DashboardLayout';
import { Account, AccountPreview, AccountPopoverFooter, SignOutButton, AccountPreviewProps,} from '@toolpad/core/Account';
import type { Navigation, Router, Session, Branding } from '@toolpad/core/AppProvider';
import { useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';

const Brand: Branding = {
  title:"Grupo 8",
  logo: ""
};

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Menu de navegación',
  },
  {
    segment: 'requerimientos',
    title: 'Requerimientos',
    icon: <ListAlt />,
  },
  {
    segment: 'usuarios',
    title: 'Usuarios',
    icon: <PeopleAlt />,
  },
];

type Config = {
  columns: { field: string; headerName: string; width: number; type?: string }[];
  endpoint: string; // Agregamos un endpoint asociado a cada tipo de datos
};

function getConfig(pathname: string): Config {
  switch (pathname) {
    case '/usuarios':
      return {
        columns: [
          { field: 'nombre', headerName: 'Nombre', width: 150 },
          { field: 'apellido', headerName: 'Apellido', width: 150 },
          { field: 'username', headerName: 'Username', width: 200 },
          { field: 'email', headerName: 'Correo Electrónico', width: 200 },
          { field: 'legajo', headerName: 'Legajo', width: 120 },
          { field: 'cargo', headerName: 'Cargo', width: 200 },
          { field: 'departamento', headerName: 'Departamento', width: 200 },
        ],
        endpoint: 'http://localhost:8080/usuarios', // Ruta del endpoint para obtener usuarios
      };

    case '/requerimientos':
      return {
        columns: [
          { field: 'id', headerName: 'ID', width: 90 },
          { field: 'title', headerName: 'Título', width: 200 },
          { field: 'description', headerName: 'Descripción', width: 300 },
          { field: 'status', headerName: 'Estado', width: 150 },
        ],
        endpoint: '/api/requerimientos', // Ruta del endpoint para obtener requerimientos
      };

    default:
      return {
        columns: [],
        endpoint: '',
      };
  }
}

function DemoPageContent({ pathname }: { pathname: string }) {

  interface Usuario {
    nombre: string;
    apellido: string;
    username: string;
    email: string;
    legajo: string;
    departamento: string;
    cargo: string;
  }

  const { columns, endpoint } = getConfig(pathname);
  const [rows, setRows] = useState([]); // Estado para las filas
  const [loading, setLoading] = useState(true); // Estado para el indicador de carga
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores

  useEffect(() => {
    if (!endpoint) return;

    // Función para obtener datos
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();

        // Transforma los datos para que coincidan con las columnas requeridas
        const transformedRows = data.map((item: Usuario) => ({
          id: item.legajo, // Material-UI Data Grid requiere que cada fila tenga un identificador único (id). Por seguridad repito el legajo y no pongo el id de la BD.
          nombre: item.nombre,
          apellido: item.apellido,
          username: item.username.trim(),
          email: item.email,
          legajo: item.legajo,
          cargo: item.cargo,
          departamento: item.departamento,
        }));
        

        setRows(transformedRows); // Asigna los datos transformados al estado
      } catch (err) {
        setError((err as Error).message || 'Ocurrió un error');
      } finally {
        setLoading(false); // Finaliza el indicador de carga
      }
    };

    fetchData();
  }, [endpoint]);

  return (
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
        <CircularProgress /> // Indicador de carga
      ) : error ? (
        <Typography color="error">{error}</Typography> // Mensaje de error
      ) : columns.length > 0 && rows.length > 0 ? (
        <CrudGrid
          columns={columns}
          initialRows={rows}
          entityName={pathname.slice(1)} // Usa el nombre de la ruta como entidad
        />
      ) : (
        <Typography>No hay datos disponibles para la ruta: {pathname}</Typography>
      )}
    </Box>
  );
}
function AccountSidebarPreview(props: AccountPreviewProps & { mini: boolean }) {
  const { handleClick, open, mini } = props;
  return (
    <Stack direction="column" p={0} overflow="hidden">
      <Divider />
      <AccountPreview
        variant={mini ? 'condensed' : 'expanded'}
        handleClick={handleClick}
        open={open}
      />
    </Stack>
  );
}

const accounts = [
  {
    id: 1,
    name: 'Marcelo Gallardo',
    email: 'marcelogallardo@gmail.com',
    image: 'https://www.clarin.com/img/2024/07/31/UQVo2vePn_1256x620__1.jpg',
  }
];

function SidebarFooterAccountPopover() {
  return (
    <Stack direction="column">
      <Typography variant="body2" mx={2} mt={1}>
        Cuenta
      </Typography>
      <MenuList>
        {accounts.map((account) => (
          <MenuItem
            key={account.id}
            component="button"
            sx={{
              justifyContent: 'flex-start',
              width: '100%',
              columnGap: 2,
            }}
          >
            <ListItemIcon>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.95rem',
                }}
                src={account.image ?? ''}
                alt={account.name ?? ''}
              >
                {account.name[0]}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                width: '100%',
              }}
              primary={account.name}
              secondary={account.email}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>
        ))}
      </MenuList>
      <Divider />
      <AccountPopoverFooter>
        <SignOutButton />
      </AccountPopoverFooter>
    </Stack>
  );
}

const createPreviewComponent = (mini: boolean) => {
  function PreviewComponent(props: AccountPreviewProps) {
    return <AccountSidebarPreview {...props} mini={mini} />;
  }
  return PreviewComponent;
};

function SidebarFooterAccount({ mini }: SidebarFooterProps) {
  const PreviewComponent = React.useMemo(() => createPreviewComponent(mini), [mini]);
  return (
    <Account
      slots={{
        preview: PreviewComponent,
        popoverContent: SidebarFooterAccountPopover,
      }}
      slotProps={{
        popover: {
          transformOrigin: { horizontal: 'left', vertical: 'bottom' },
          anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
          disableAutoFocus: true,
          slotProps: {
            paper: {
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: (theme) =>
                  `drop-shadow(0px 2px 8px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.32)'})`,
                mt: 1,
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  bottom: 10,
                  left: 0,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translate(-50%, -50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            },
          },
        },
      }}
    />
  );
}


const demoSession = {
  user: {
    name: 'Marcelo Gallardo',
    email: 'marcelogallardo@gmail.com',
    image: 'https://www.clarin.com/img/2024/07/31/UQVo2vePn_1256x620__1.jpg',
  },
};

export default function DashboardLayoutAccountSidebar() {


  const [pathname, setPathname] = React.useState('/dashboard');

  const router = React.useMemo<Router>(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);


  const [session, setSession] = React.useState<Session | null>(demoSession);
  const authentication = React.useMemo(() => {
    return {
      signIn: () => {
        setSession(demoSession);
      },
      signOut: () => {
        setSession(null);
      },
    };
  }, []);

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      authentication={authentication}
      session={session}
      branding={Brand}
    >
      <DashboardLayout
         slots={{
          toolbarAccount: () => null,
          sidebarFooter: SidebarFooterAccount,  
        }}
      > 

        <DemoPageContent pathname={pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}
