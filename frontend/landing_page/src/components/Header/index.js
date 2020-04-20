/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-use-before-define */
import React, { useState, useEffect } from 'react';
import useScrollTrigger from '@material-ui/core/useScrollTrigger';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import { useLocation } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Avatar from '@material-ui/core/Avatar';
// import logo from '../../assets/img/linea.png';
import { getLoggedUser, urlLogin, urlLogout } from '../../Services/loginService';
import styles from './styles';

function Header() {
  const location = useLocation();
  const trigger = useScrollTrigger({
    threshold: 10,
    disableHysteresis: true,
  });
  const classes = styles({
    scrollActive: trigger,
    pathname: location.pathname,
  });

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  function UserLogged() {
    return (
      <>
        <Button color="inherit" onClick={handleClick}>
          <Avatar className={classes.avatar}>
            {user.username.substr(0, 1) || ''}
          </Avatar>
          {user.username || ''}
        </Button>
        <Popover
          id="simple-popover"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            style: {
              transform: 'translateX(calc(100vw - 185px)) translateY(45px)',
            },
          }}
        >
          <List className={classes.list}>
            <ListItem button>
              <Button
                href={urlLogout}
                color="inherit"
                startIcon={<ExitToAppIcon />}
              >
                Logout
              </Button>
            </ListItem>
          </List>
        </Popover>
      </>
    );
  }

  function UserUnLogged() {
    return (
      <>
        <Button href={urlLogin} color="inherit">Sign in</Button>
        <Button color="inherit">Sign up</Button>
      </>
    );
  }

  const [user, setUser] = useState(undefined);
  useEffect(() => {
    getLoggedUser().then((result) => setUser(result));
  }, []);
  useEffect(() => {}, [user]);

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
    // {
    //   description: 'Releases',
    //   href: 'https://github.com/linea-it/dri/releases',
    //   target: '_blank',
    // },
  ];

  return (
    <AppBar position="static" className={classes.appbar}>
      <Toolbar>
        {menus.map((menu, index) => <Button color="inherit" key={index} href={menu.href}>{menu.description}</Button>)}
        <div className={classes.separator} />
        {/* TODO: verificar se o usuario esta logado */}
        { user ? (user.username ? <UserLogged /> : <UserUnLogged />) : '' }
      </Toolbar>
    </AppBar>
  );
}

export default Header;
