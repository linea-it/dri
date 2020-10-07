import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(12),
    width: '80%',
    margin: 'auto',
  },
  carouselItem: {
    maxWidth: '150px',
    width: 'auto',
    height: 'auto',
    margin: 'auto',
  },
}));

export default styles;
