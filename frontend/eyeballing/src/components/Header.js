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
    marginRight: theme.spacing(2),
  },
});

function Header(props) {
  const { classes, title, username, releases, currentRelease } = props;
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

          <Typography variant="h6" color="inherit" className={classes.username}>
            {username}
          </Typography>
          <IconButton color="inherit" className={classes.menuButton}>
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
  releases: PropTypes.array,
  currentRelease: PropTypes.any,
  onChangeRelease: PropTypes.func.isRequired,
};

export default withStyles(styles, { withTheme: true })(Header);
