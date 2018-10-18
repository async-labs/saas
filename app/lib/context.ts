import grey from '@material-ui/core/colors/grey';
import { createGenerateClassName, createMuiTheme } from '@material-ui/core/styles';
import { SheetsRegistry } from 'react-jss';

const theme = createMuiTheme({
  palette: {
    primary: { main: grey[300] },
    secondary: { main: grey[500] },
    type: 'dark',
  },
  typography: {
    useNextVariants: true,
  },
});

function createPageContext() {
  return {
    theme,
    sheetsManager: new Map(),
    sheetsRegistry: new SheetsRegistry(),
    generateClassName: createGenerateClassName(),
  };
}

export default function getContext() {
  if (!process.browser) {
    return createPageContext();
  }

  if (!global.INIT_MATERIAL_UI) {
    global.INIT_MATERIAL_UI = createPageContext();
  }

  return global.INIT_MATERIAL_UI;
}
