import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import { Typography, Toolbar } from '@material-ui/core';
import logo from '../../assets/img/linea-logo-mini.png';
import useStyles from './styles';

function Footer() {
  const classes = useStyles();

  return (
    <footer className={classes.root}>
      <AppBar
        position="fixed"
        className={classes.appBarDrawerClose}
      >
        <Toolbar className={classes.toolbar}>
          <Typography color="inherit">
            {/* <span>Testing</span> */}
            {' '}
            {/* <span className={classes.versionLink}>1.0.0</span> */}
          </Typography>
          <Typography color="inherit">
            <span className={classes.poweredBy}>Powered by</span>
            <a
              href="http://www.linea.gov.br/"
              target="blank"
              className={classes.logoLink}
            >
              <img
                src={logo}
                title="LIneA"
                alt="LineA"
                style={{ cursor: 'pointer', marginLeft: '10px', width: '75px' }}
              />
            </a>
          </Typography>
        </Toolbar>
      </AppBar>
    </footer>
  );
}
export default Footer;
