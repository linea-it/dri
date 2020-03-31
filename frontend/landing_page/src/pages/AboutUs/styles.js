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
    color: '#141412',
    paddingTop: 15,
    // fontSize: '16px',
    // lineHeight: 1.5,
    // fontFamily: 'Helvetica Neue,Helvetica,Arial,sans-serif',
  },
}));

export default styles;
