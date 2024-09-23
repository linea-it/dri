import { createTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';
import green from '@material-ui/core/colors/green';

const theme = createTheme({
  primary: {
    main: '#212121',
    background: {
      default: '#212121',
    },
  },
  secondary: {
    main: green[500],
  },
  palette: {
    // background: '#151515', Cor utilizada nos outros apps
    // decidi usar a cor da palleta não percebi muita diferença.
    appbarcolor: grey[900],
  },
  initContainer: {
    paddingTop: 20,
    paddingBottom: 100,
  },
});

export default theme;
