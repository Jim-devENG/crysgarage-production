import { createTheme } from '@mui/material/styles';

export const CustomTheme = createTheme({
  palette: {
    primary: {
      main: '#d4af37', // Crys Gold
    },
    secondary: {
      main: '#1a1a1a', // Dark background
    },
    background: {
      default: '#0a0a0a', // Crys Black
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a0a0a0',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          border: '1px solid #333333',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#333333',
          color: '#ffffff',
        },
      },
    },
  },
});

