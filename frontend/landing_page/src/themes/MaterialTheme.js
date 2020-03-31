import { createMuiTheme } from '@material-ui/core/styles';
import pink from '@material-ui/core/colors/pink';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#17AEBF',
      main: '#151515',
      dark: '#243141',
      contrastText: '#fff',
    },
    secondary: pink,
  },
  typography: {
    fontSize: 16,
    useNextVariants: true,
  },
  overrides: {
    MuiListItem: {
      root: {
        justifyContent: 'center',
      },
    },
  },
  initContainer: {
    paddingTop: 120,
  },
});

export default theme;
