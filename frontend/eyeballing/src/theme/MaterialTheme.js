import { createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';

const primary = grey[900];
const secondary = grey[50];
const textPrimary = grey[50];
const textSecondary = grey[900];

const theme = createMuiTheme({
  palette: {
    primary: { main: primary },
    secondary: { main: secondary },
    textPrimary: { main: textPrimary },
    textSecondary: textSecondary,
    background: primary,
  },
  typography: {
    fontSize: 16,
  },
});

export default theme;
