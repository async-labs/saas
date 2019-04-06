import grey from '@material-ui/core/colors/grey';
import { createGenerateClassName, createMuiTheme } from '@material-ui/core/styles';
import { SheetsRegistry } from 'react-jss';

const themeDark = createMuiTheme({
  palette: {
    primary: { main: grey[200] },
    secondary: { main: grey[400] },
    type: 'dark',
  },
  typography: {
    useNextVariants: true,
  },
});

const themeLight = createMuiTheme({
  palette: {
    primary: { main: grey[800] },
    secondary: { main: grey[900] },
    type: 'light',
  },
  typography: {
    useNextVariants: true,
  },
});

function createPageContext({ store }) {
  return {
    theme: store.currentUser && store.currentUser.darkTheme ? themeDark : themeLight,
    sheetsManager: new Map(),
    sheetsRegistry: new SheetsRegistry(),
    generateClassName: createGenerateClassName(),
  };
}

export default function getContext({ store }) {
  if (!(process as any).browser) {
    return createPageContext({ store });
  }

  if (!(global as any).INIT_MATERIAL_UI) {
    (global as any).INIT_MATERIAL_UI = createPageContext({ store });
  }

  return (global as any).INIT_MATERIAL_UI;
}
