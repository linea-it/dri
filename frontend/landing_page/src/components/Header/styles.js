import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles((theme) => ({
  list: {
    padding: 0,
  },
  avatar: {
    marginRight: 10,
  },
  root: {
    flexGrow: 1,
  },
  appbar: {
    background: theme.palette.appbarcolor,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  separator: {
    flexGrow: 1,
  },
}));

export default styles;
