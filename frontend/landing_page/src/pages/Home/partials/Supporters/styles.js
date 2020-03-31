import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(12),
  },
  media: {
    width: 'inherit',
    cursor: 'pointer',
    margin: 'auto',
  },
}));

export default styles;
