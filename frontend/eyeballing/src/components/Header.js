import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import logo from '../assets/img/icon-des.png';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import HomeIcon from '@material-ui/icons/Home';
import SelectReleases from '../components/SelectReleases';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import { logout } from '../api/Api';
const styles = theme => ({
  appBar: {
    top: 'auto',
    bottom: 0,
  },
  media: {
    height: '',
    width: '',
  },
  grow: {
    flexGrow: 1,
  },
  username: {
    marginLeft: theme.spacing(2),
  },
  menuButton: {
    marginRight: theme.spacing(1),
  },
});

function Header(props) {
  const { classes, title, username, releases, currentRelease } = props;

  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleAbout() {
    handleClose();
    window.open('http://www.linea.gov.br');
  }
  function handleLogout() {
    handleClose();
    logout();
  }

  function handleHome() {
    var protocol = window.location.protocol,
      host = window.location.host,
      location = protocol + '//' + host + '/';

    window.location.assign(location);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit">
            <img alt="logo DES" src={logo} />
          </IconButton>
          <Typography className={classes.grow} variant="h6" color="inherit">
            {title}
          </Typography>

          <SelectReleases
            releases={releases}
            value={currentRelease}
            handleChange={props.onChangeRelease}
          />

          <Typography
            variant="subtitle1"
            color="inherit"
            className={classes.username}
          >
            {username}
          </Typography>
          <IconButton
            color="inherit"
            className={classes.menuButton}
            onClick={handleHome}
          >
            <HomeIcon />
          </IconButton>

          <IconButton
            className={classes.menuButton}
            onClick={handleClick}
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleAbout}>About LIneA</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string,
  username: PropTypes.string,
  releases: PropTypes.array,
  currentRelease: PropTypes.any,
  onChangeRelease: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(Header);