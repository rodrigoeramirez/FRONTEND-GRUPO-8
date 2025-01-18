import * as React from 'react';
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
import { DashboardLayout, SidebarFooterProps } from '@toolpad/core/DashboardLayout';
import { Account, AccountPreview, AccountPopoverFooter, AccountPreviewProps } from '@toolpad/core/Account';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Navigation, Router, Session, Branding } from '@toolpad/core/AppProvider';
import { PageContent } from './PageContent';

// Branding de la app
const Brand: Branding = {
  title: 'Grupo 8',
  logo: '',
};

// Navegación
const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Menú de navegación',
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

// Componente para el popover de la cuenta
function SidebarFooterAccountPopover() {
  const { userInfo, setUserInfo } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setUserInfo(null); // Actualiza el estado global
    navigate('/');
  };

  return (
    <Stack direction="column">
      <Typography variant="body2" mx={2} mt={1}>
        Cuenta
      </Typography>
      <MenuList>
        {userInfo && (
          <MenuItem sx={{ justifyContent: 'flex-start', width: '100%', columnGap: 2 }}>
            <ListItemIcon>
              <Avatar
                sx={{ width: 32, height: 32, fontSize: '0.95rem' }}
                src={`https://ui-avatars.com/api/?name=${userInfo.nombre}+${userInfo.apellido}&background=007bff&color=fff&rounded=true`}
                alt={userInfo.nombre}
              >
                {userInfo.nombre[0]}
              </Avatar>
            </ListItemIcon>
            <ListItemText
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}
              primary={userInfo.nombre}
              secondary={userInfo.email}
              primaryTypographyProps={{ variant: 'body2' }}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </MenuItem>
        )}
      </MenuList>
      <Divider />
      <AccountPopoverFooter>
        <MenuItem onClick={handleSignOut}>Cerrar sesión</MenuItem>
      </AccountPopoverFooter>
    </Stack>
  );
}

function createPreviewComponent(mini: boolean) {
  function PreviewComponent(props: AccountPreviewProps) {
    return <AccountPreview {...props} variant={mini ? 'condensed' : 'expanded'} />;
  }
  return PreviewComponent;
}

function SidebarFooterAccount({ mini }: SidebarFooterProps) {
  const PreviewComponent = React.useMemo(() => createPreviewComponent(mini), [mini]);
  return (
    <Account
      slots={{
        preview: PreviewComponent,
        popoverContent: SidebarFooterAccountPopover,
      }}
    />
  );
}

// Componente principal
export default function DashboardLayoutAccountSidebar() {
  const [pathname, setPathname] = React.useState('/dashboard');
  const router = React.useMemo<Router>(() => {
    return {
      pathname,
      searchParams: new URLSearchParams(),
      navigate: (path) => setPathname(String(path)),
    };
  }, [pathname]);

  const { userInfo } = useAuth();

  // Actualiza la sesión cuando `userInfo` cambia
  const [session, setSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    if (userInfo) {
      setSession({
        user: {
          name: `${userInfo.nombre || ''} ${userInfo.apellido || ''}`,
          email: userInfo.email || '',
          image: `https://ui-avatars.com/api/?name=${userInfo.nombre}+${userInfo.apellido}&background=007bff&color=fff&rounded=true`,
        },
      });
    }
  }, [userInfo]);

  const auth = React.useMemo(() => {
    return {
      signIn: () => setSession(session),
      signOut: () => setSession(null),
    };
  }, [session]);

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      authentication={auth}
      session={session}
      branding={Brand}
    >
      <DashboardLayout
        slots={{
          toolbarAccount: () => null,
          sidebarFooter: SidebarFooterAccount,
        }}
        defaultSidebarCollapsed={true}
        sidebarExpandedWidth={300}
      >
        <PageContent pathname={pathname} />
      </DashboardLayout>
    </AppProvider>
  );
}
