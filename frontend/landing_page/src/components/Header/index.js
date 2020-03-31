import React from 'react';

import {
  Grid, Container, List, ListItem, useScrollTrigger, Button, Avatar,
} from '@material-ui/core';
// import Grid from '@material-ui/core/Grid';
// import List from '@material-ui/core/List';
// import ListItem from '@material-ui/core/ListItem';
// import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import { useLocation } from 'react-router-dom';
import logo from '../../assets/img/linea.png';
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
      description: 'Help',
      href: '/help',
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
    <>
      <div className={classes.toolbarWrapper}>
        <Container>
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="flex-start"
            spacing={0}
            className={classes.container}
          >
            <Grid item xs={12} sm={2} md={1}>
              <img src={logo} alt="LIneA" className={classes.logo} />
            </Grid>
            <Grid item xs={12} sm={8} md={7}>
              <List className={classes.menuList}>
                {menus.map((menu, index) => (
                  <ListItem key={index.toString()}>
                    <a
                      href={menu.href}
                      target={menu.target}
                      className={classes.menuLink}
                    >
                      {menu.description}
                    </a>
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} sm={2} md={4} className={classes.icons}>
              <div className={classes.separatorToolBar} />
              <Button className={classes.button}>
                <div className={classes.userWrapper}>
                  <Avatar className={classes.avatar}>MT</Avatar>
                </div>
                <div>
                  <span className={classes.username}>Matheus</span>
                </div>
              </Button>
            </Grid>
          </Grid>
        </Container>
        <div className={classes.backgroundHeader} />
      </div>
    </>
  );
}

export default Footer;
