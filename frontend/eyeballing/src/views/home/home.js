import React from 'react';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import Inline from '../../components/inline-style';

const API_URL =
  process.env.NODE_ENV === 'production'
    ? window._env_.REACT_APP_API_URL
    : process.env.REACT_APP_API_URL;

function App() {
  return (
    <div>
      <AppBar position="static">
        <Typography variant="h6" color="inherit">
          AppBar API: {API_URL}
        </Typography>
      </AppBar>
      <Inline />
      <Button color="primary">Test Primary</Button>
      <Button color="secondary">Test Secondary</Button>
    </div>
  );
}

export default App;
