import { makeStyles } from '@material-ui/core/styles';
import { deepOrange } from '@material-ui/core/colors';

const styles = makeStyles((theme) => ({
  root: {
    background: `url(${process.env.PUBLIC_URL}/img/home1.jpg)`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    paddingTop: '40px',
  },
  container: {
    background: 'transparent',
    position: 'relative',
    textAlign: 'center',
    color: '#FFF',
    zIndex: 2,
    marginTop: '0',
    minHeight: 450,
  },
  table: {
    margin: 'auto',
    paddingBottom: 8,
  },
  logo: {
    maxHeight: 48,
    paddingTop: '8px',
  },
  particlesWrapper: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 1,
    height: '530px',
  },
  userWrapper: {
    borderRadius: '50%',
    margin: '0 7px',
  },
  button: {
    zIndex: 1,
    [theme.breakpoints.up('sm')]: {
      float: 'right',
    },
  },
  title: {
    fontFamily: 'Oxanium',
    textTransform: 'uppercase',
    fontWeight: 100,
    marginTop: -30,
    fontSize: 28,
    [theme.breakpoints.up('sm')]: {
      fontSize: 35,
      marginTop: -38,
    },
    width: 'max-content',
    textShadow: 'black 0.1em 0.1em 0.2em',
  },
  subtitle: {
    fontFamily: 'Oxanium',
    textTransform: 'uppercase',
    fontWeight: 100,
    marginTop: -30,
    fontSize: 28,
    [theme.breakpoints.up('sm')]: {
      fontSize: 35,
      marginTop: -38,
    },
    paddingTop: 8,
    margin: 'auto',
    width: 'max-content',
    textShadow: 'black 0.1em 0.1em 0.2em',
  },
  positionTitle: {
    paddingTop: '8%',

  },
  driLogo: {
    [theme.breakpoints.up('sm')]: {
      maxWidth: 150,
    },
    maxWidth: '100%',
  },
  titleWrapper: {
    [theme.breakpoints.up('sm')]: {
      margin: `${theme.spacing(12)}px 0 ${theme.spacing(16)}px`,
    },
  },
  descriptionWrapper: {
    margin: 'auto',
    textShadow: '1px 1px 1px #333',
  },
  avatar: {
    margin: 10,
    cursor: 'pointer',
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: deepOrange[500],
  },
}));

export default styles;
