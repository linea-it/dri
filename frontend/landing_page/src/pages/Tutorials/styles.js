import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles((theme) => ({
  initContainer: theme.initContainer,
  root: {
    paddingTop: 25,
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  treeItem: {
    padding: 6,
  },
  treeView: {
    maxHeight: 460,
    overflow: 'overlay',
  },
}));

export default styles;
