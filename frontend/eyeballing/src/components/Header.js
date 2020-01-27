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
import MenuIcon from '@material-ui/icons/Menu';
import HelpIcon from '@material-ui/icons/Help';
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
  },
  menuButton: {
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
    window.open('http://www.linea.gov.br');
  }
  function handleLogout() {
    handleClose();
    logout();
  }

  function handleHomeEyeballing() {
    const { protocol } = window.location;
    const { host } = window.location;
    const location = `${protocol}//${host}/eyeballing`;

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

  function handleHelp() {
    setTutorialOpen(true);
  }

  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={handleHomeEyeballing}>
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
            // className={classes.menuButton}
            onClick={handleHelp}
            color="inherit"
            title="Help"
          >
            <HelpIcon />
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
