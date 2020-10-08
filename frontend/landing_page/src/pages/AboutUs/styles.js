import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles((theme) => ({
  initContainer: theme.initContainer,
  textFields: {
    marginBottom: theme.spacing(4),
  },
  grid: {
    margin: 'auto',
  },
  textFormat: {
    marginTop: 40,
    fontSize: '1.07rem!important',
    fontFamily: 'arial',
    fontWeight: '100',
    lineHeight: '1.5',
    textAlign: 'justify',
    color: 'black',
    letterSpacing: '0.0em',
  },
}));

export default styles;
