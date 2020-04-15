import React from 'react';

import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import { useLocation } from 'react-router-dom';
// import logo from '../../assets/img/linea.png';
import styles from './styles';


function Footer() {
  const location = useLocation();
  const trigger = useScrollTrigger({
    threshold: 10,
    disableHysteresis: true,
  });

  const menus = [
    {
      description: 'Home',
      href: '/',
      target: '_self',
    },
    {
      description: 'About us',
      href: '/about-us',
      target: '_self',
    },
    {
      description: 'Tutorials',
      href: '/tutorials',
      target: '_self',
    },
    {
      description: 'Contact us',
      href: '/contact-us',
      target: '_self',
    },
    {
      description: 'Releases',
      href: 'https://github.com/linea-it/dri/releases',
      target: '_blank',
    },
  ];

  const classes = styles({
    scrollActive: trigger,
    pathname: location.pathname,
  });

  return (
    <AppBar position="static" className={classes.appbar}>
      <Toolbar>
        <Button color="inherit">Home</Button>
        <Button color="inherit">About us</Button>
        <Button color="inherit">Tutorials</Button>
        <Button color="inherit">Contact us</Button>
        <div className={classes.separator} />
        {/* TODO: verificar se o usuario esta logado */}
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
  );
}

export default Footer;
