import { createTheme } from '@mui/material/styles';

const themeDark = createTheme({
  palette: {
    primary: { main: '#238636' },
    secondary: { main: '#b62324' },
    mode: 'dark',
    background: { default: '#0d1117' },
    text: {
      primary: '#c9d1d9',
    },
  },
  typography: {
    fontFamily: ['IBM Plex Mono', 'monospace'].join(','),
    button: {
      textTransform: 'none',
    },
  },
});

const themeLight = createTheme({
  palette: {
    primary: { main: '#238636' },
    secondary: { main: '#b62324' },
    mode: 'light',
    background: { default: '#fff' },
    text: {
      primary: '#222',
    },
  },
  typography: {
    fontFamily: ['IBM Plex Mono', 'monospace'].join(','),
    button: {
      textTransform: 'none',
    },
  },
});

export { themeDark, themeLight };
