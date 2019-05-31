import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import logo from '../assets/img/icon-des.png';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import HomeIcon from '@material-ui/icons/Home';

import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { fade } from '@material-ui/core/styles/colorManipulator';

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

  cmbRelease: {
    position: 'relative',
    // width: 200,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      // marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
});

function Header(props) {
  const { classes, title, username } = props;
  return (
    <React.Fragment>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" aria-label="Menu">
            <img alt="logo DES" src={logo} />
          </IconButton>
          <Typography className={classes.grow} variant="h6" color="inherit">
            {title}
          </Typography>



          <Typography variant="h6" color="inherit">
            {username}
          </Typography>
          <IconButton color="inherit" aria-label="Home">
            <HomeIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string,
  username: PropTypes.string,
};

export default withStyles(styles, { withTheme: true })(Header);
