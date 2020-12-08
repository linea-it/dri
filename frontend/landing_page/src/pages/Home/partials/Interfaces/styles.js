import { makeStyles } from '@material-ui/core/styles';


const styles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    zIndex: 2,
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(6),
    // margin: '48px auto 96px auto',
  },
  titleItem: {
    fontFamily: 'Oxanium',
    fontSize: '2em',
    paddingTop: '0.5em',
    paddingLeft: '0.5em',
    color: 'white',
    textShadow: '0.1em 0.1em 0.1em black',
  },
  media: {
    minHeight: 220,
  },
  icon: {
    maxWidth: 50,
  },
  card: {
    padding: '3%',
    margin: 'auto',
  },
  grid: {
    margin: 'auto',
  },
}));

export default styles;
