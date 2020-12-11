import { makeStyles } from '@material-ui/core/styles';
import { deepOrange } from '@material-ui/core/colors';

const styles = makeStyles((theme) => ({
  root: {
    background: `url(${process.env.PUBLIC_URL}/img/home1.jpg)`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    paddingTop: '20px',
  },
  container: {
    background: 'transparent',
    position: 'relative',
    textAlign: 'center',
    color: '#FFF',
    zIndex: 2,
    marginTop: '0',
    minHeight: 220,
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
    // textTransform: 'uppercase',
    fontWeight: 100,
    marginTop: -30,
    fontSize: 28,
    [theme.breakpoints.up('sm')]: {
      fontSize: 60,
      marginTop: -38,
    },
    width: 'max-content',
    textShadow: 'black 0.1em 0.1em 0.2em',
  },
  subtitle: {
    position: 'relative',
    width: '400px',
    marginTop: '-22px',
    fontFamily: 'Oxanium',
    fontWeight: 100,
    fontSize: 28,
    [theme.breakpoints.up('sm')]: {
      fontSize: 35,
      marginTop: -26,
    },
    paddingTop: 8,
    textShadow: 'black 0.1em 0.1em 0.2em',
  },
  positionTitle: {
    textAlign: '-webkit-center',

  },
  driLogo: {
    margin: '-33px 0px 0px 85px',
    position: 'relative',
    float: 'left',
    [theme.breakpoints.up('sm')]: {
      maxWidth: 80,
    },
    maxWidth: 80,
  },
  titleWrapper: {
    [theme.breakpoints.up('sm')]: {
      margin: `${theme.spacing(8)}px 0 ${theme.spacing(2)}px`,
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
  separatorToolBar: {
    flexGrow: 1,
  },
  floarRight: {
    width: '100%',
    textAlign: 'right',
    paddingRight: 40,
  },
}));

export default styles;
