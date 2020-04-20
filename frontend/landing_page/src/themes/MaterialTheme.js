import { createMuiTheme } from '@material-ui/core/styles';
import grey from '@material-ui/core/colors/grey';

const theme = createMuiTheme({
  palette: {
    // background: '#151515', Cor utilizada nos outros apps
    // decidi usar a cor da palleta não percebi muita diferença.
    appbarcolor: grey[900],
  },
  initContainer: {
    paddingTop: 20,
  },
});

export default theme;
