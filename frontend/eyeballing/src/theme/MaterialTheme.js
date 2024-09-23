import { createTheme } from '@material-ui/core/styles'
import pink from '@material-ui/core/colors/pink';
import green from '@material-ui/core/colors/green';

const theme = createTheme({
  palette: {
    primary: {
      light: '#5c6b7d',
      main: '#24292e',
      dark: '#243141',
      // contrastText: '#fff',
    },
    secondary: pink,
  },
  typography: {
    useNextVariants: true,
    successColor: green[500],
  },
  overrides: {
    Pagination: {
      activeButton: {
        color: pink[500],
      },
    },
    MuiListItem: {
      container: {
        listStyleType: 'none',
      },
    },
    MuiCardHeader: {
      root: {
        backgroundColor: 'rgb(248, 249, 252)',
        borderBottom: '1px solid rgb(227, 230, 240)',
        paddingTop: 5,
        paddingBottom: 5,
      },
      title: {
        color: '#34465d',
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    MuiIcon: {
      root: {
        fontSize: '1rem',
      },
    },
    MuiCard: {
      root: {
        position: 'relative',
      },
    },
    MuiCardContent: {
      root: {
        position: 'relative',
      },
    },
  },
});

export default theme;
