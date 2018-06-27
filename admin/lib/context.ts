import { SheetsRegistry } from 'react-jss';
import { createMuiTheme, createGenerateClassName } from '@material-ui/core/styles';
import blueGrey from '@material-ui/core/colors/blueGrey';
import grey from '@material-ui/core/colors/grey';

const theme = createMuiTheme({
  palette: {
    primary: { main: grey[300] },
    secondary: { main: blueGrey[300] },
    type: 'dark',
  },
  typography: {
    fontFamily: 'Muli',
    fontSize: 14,
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
