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
  },
}));

export default styles;
