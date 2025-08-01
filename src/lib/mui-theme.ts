import { createTheme } from '@mui/material/styles';

export const adminTheme = createTheme({
  palette: {
    primary: {
      main: '#566BDA', // Blue color from the design
      light: '#7B8FE8',
      dark: '#3F51B5',
    },
    secondary: {
      main: '#F8F9FB',
      light: '#FFFFFF',
      dark: '#E8ECEF',
    },
    background: {
      default: '#F8F9FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
    },
    grey: {
      100: '#F8F9FB',
      200: '#E8ECEF',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#666666',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.125rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #566BDA 0%, #7B8FE8 100%)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(135deg, #3F51B5 0%, #566BDA 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          borderRight: '1px solid #E8ECEF',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1A1A1A',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          borderRadius: '12px',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#F8F9FB',
            borderBottom: '1px solid #E8ECEF',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#666666',
          },
          '& .MuiDataGrid-row': {
            borderBottom: '1px solid #F0F0F0',
            '&:hover': {
              backgroundColor: '#F8F9FB',
            },
          },
          '& .MuiDataGrid-cell': {
            fontSize: '0.875rem',
            padding: '12px 16px',
          },
        },
      },
    },
  },
});