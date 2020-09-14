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
    marginTop: 40,
  },
}));

export default styles;
