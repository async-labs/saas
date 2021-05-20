import { createMuiTheme } from '@material-ui/core/styles';

const themeDark = createMuiTheme({
  palette: {
    primary: { main: '#238636' },
    secondary: { main: '#b62324' },
    type: 'dark',
    background: { default: '#0d1117' },
  },
  typography: {
    fontFamily: ['IBM Plex Mono', 'monospace', 'Roboto', 'sans-serif'].join(','),
    button: {
      textTransform: 'none',
    },
  },
});

const themeLight = createMuiTheme({
  palette: {
    primary: { main: '#238636' },
    secondary: { main: '#b62324' },
    type: 'light',
    background: { default: '#fff' },
  },
  typography: {
    fontFamily: ['IBM Plex Mono', 'monospace', 'Roboto', 'sans-serif'].join(','),
    button: {
      textTransform: 'none',
    },
  },
});

export { themeDark, themeLight };
