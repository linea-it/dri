import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import HomeIcon from '@material-ui/icons/Home';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Divider from '@material-ui/core/Divider';
import MenuIcon from '@material-ui/icons/Menu';
import HelpIcon from '@material-ui/icons/Help';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import LogoutIcon from '@material-ui/icons/ExitToApp';
import SelectReleases from './SelectReleases';
import logo from '../assets/img/icon-des.png';
import { logout } from '../api/Api';
import TutorialDialog from './TutorialDialog';

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
    marginRight: theme.spacing(2),
  },
  menuButton: {
    marginRight: theme.spacing(1),
  },
  menuIcon: {
    marginRight: theme.spacing(1),
  },
});

function Header(props) {
  const {
    classes, title, username, releases, currentRelease, tutorial,
  } = props;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [tutorialOpen, setTutorialOpen] = React.useState(false);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleAbout() {
    handleClose();
    window.open('https://www.linea.org.br');
  }
  function handleLogout() {
    handleClose();
    logout();
  }

  function handleHomeTileViewer() {
    const { protocol } = window.location;
    const { host } = window.location;
    const location = `${protocol}//${host}/tile_viewer/`;

    window.location.assign(location);
  }

  function handleHome() {
    const { protocol } = window.location;
    const { host } = window.location;
    const location = `${protocol}//${host}/`;

    window.location.assign(location);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  function handleTutorials() {
    setTutorialOpen(true);
  }

  function handleHelp() {
    const { protocol } = window.location;
    const { host } = window.location;
    const location = `${protocol}//${host}/contact-us/`;

    console.log('location', location);

    handleClose();

    window.open(location);
  }

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={handleHomeTileViewer}>
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
            // className={classes.menuButton}
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
            <MenuItem onClick={handleAbout}>
              About LIneA
            </MenuItem>
            <MenuItem onClick={handleTutorials}>
              <HelpIcon className={classes.menuIcon} fontSize="small" />
              <Typography>Tutorials</Typography>
            </MenuItem>
            <MenuItem onClick={handleHelp}>
              <HelpOutlineIcon className={classes.menuIcon} fontSize="small" />
              <Typography>Help</Typography>
            </MenuItem>

            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon className={classes.menuIcon} fontSize="small" />
              <Typography>Logout</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <TutorialDialog
        open={tutorialOpen}
        setClose={() => setTutorialOpen(false)}
        data={tutorial}
      />
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
