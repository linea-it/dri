import { createMuiTheme } from '@material-ui/core/styles';
import pink from '@material-ui/core/colors/pink';
import green from '@material-ui/core/colors/green';
const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#5c6b7d',
      main: '#34465d',
      dark: '#243141',
      contrastText: '#fff',
    },
    secondary: pink,
  },
  typography: {
    useNextVariants: true,
    successColor: green[500],
  },
});

export default theme;
