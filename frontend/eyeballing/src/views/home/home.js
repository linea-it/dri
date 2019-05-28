import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Grid } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';

import VisiomaticPanel from '../../components/visiomatic/Visiomatic';

const API_URL =
  process.env.NODE_ENV === 'production'
    ? window._env_.REACT_APP_API
    : process.env.REACT_APP_API;

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    // padding: theme.spacing(2),
    textAlign: 'center',
    // color: theme.palette.text.secondary,
  },
  visiomatic: {
    width: 200,
    height: 200,
    backgroundColor: '#ff00ee',
  },
  tilelist: {
    height: 200,
    textAlign: 'center',
  }
});

function App(props) {
  const { classes } = props;

  const a = <div>Teste</div>;

  return (
    <div>
      <Header title="Eyeballing" teste={a} />
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="stretch"
        spacing={16}
      >
        <Grid item xs={3}>
          <Paper className={classes.tilelist}>Tile List</Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper className={classes.paper}>
            <VisiomaticPanel
              // image={'https://desportal.cosmology.illinois.edu/visiomatic?FIF=data/releases/desarchive/OPS/multiepoch/Y5A1/r4115/DES0223-0915/p02/qa/DES0223-0915_r4115p02.ptif'}
              image={null}
              className={classes.visiomatic}
            />
          </Paper>
        </Grid>
        <Grid item xs={3}>
          <Paper className={classes.paper}>xs=3</Paper>
        </Grid>
      </Grid>
      <Footer />
    </div>
  );
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
