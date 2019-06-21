import React from 'react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import 'typeface-roboto';
import theme from './theme/MaterialTheme';
import Home from './home';

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <Home />
    </MuiThemeProvider>
  );
}

export default App;
