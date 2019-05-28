import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import logo from '../assets/img/linea-logo-mini.png';
import Toolbar from '@material-ui/core/Toolbar';
import { Typography, CardMedia } from '@material-ui/core';

const styles = () => ({
  appBar: {
    top: 'auto',
    bottom: 0,
  },
  media: {
    marginLeft: 5,
    height: 10,
    width: 30,
  },
  toolbar: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  grow: {
    flexGrow: 1,
  },
});

function Footer(props) {
  const { classes } = props;
  return (
    <React.Fragment>
      <AppBar position="fixed" color="primary" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography className={classes.grow} color="inherit">
            {/* Developer Portal Instance */}
          </Typography>
          <Typography color="inherit">Powered by </Typography>
          <a href="http://www.linea.gov.br/" rel="noopener noreferrer">
            <CardMedia className={classes.media} image={logo} title="LIneA" />
          </a>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}

Footer.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Footer);
