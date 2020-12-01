import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: 4,
    color: theme.palette.grey[500],
  },
  closeIcon: {
    fontSize: '1rem',
  },
  zIndex: {
    zIndex: '2001 !important', // Because the z-index of the .leaflet-top.leaflet.left is 2000.
  },
  dialogTitle: {
    borderBottom: '1px solid rgb(227, 230, 240)',
    backgroundColor: 'rgb(248, 249, 252)',
    color: '#34465d',
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    marginBottom: theme.spacing(1),
  },
  dialogContent: {
    padding: theme.spacing(2),
  },
  checkboxGroup: {
    marginTop: theme.spacing(2),
  },
  cardContent: {
    paddingBottom: `${theme.spacing(2)}px !important`, // To override the .MuiCardContent-root:last-child.
  },
}));

export default useStyles;
