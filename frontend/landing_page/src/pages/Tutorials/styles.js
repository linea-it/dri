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
  item: {
    cursor: 'pointer',
    maxHeight: 460,
    overflow: 'overlay',
    borderRight: 'solid 1px #cccccc',
    borderBottom: 'solid 1px #cccccc',
    backgroundColor: '#f5f5f5',
    '&:hover': {
      background: '#efefef',
    },
  },
}));

export default styles;
