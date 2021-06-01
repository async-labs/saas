import { createMuiTheme } from '@material-ui/core/styles';

const themeDark = createMuiTheme({
  palette: {
    primary: { main: '#238636' },
    secondary: { main: '#b62324' },
    type: 'dark',
    background: { default: '#0d1117' },
    text: {
      primary: '#c9d1d9',
    },
  },
  typography: {
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
    text: {
      primary: '#222',
    },
  },
  typography: {
    button: {
      textTransform: 'none',
    },
  },
});

export { themeDark, themeLight };
