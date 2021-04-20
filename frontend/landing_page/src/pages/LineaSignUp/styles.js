import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles((theme) => ({
  initContainer: theme.initContainer,
  notfound: {
    paddingTop: '10vh',
    paddingLeft: '10vw',
    paddingRight: '10vw',
  },
  button: {
    margin: theme.spacing(2),
    backgroundColor: 'lightsteelblue',
  },
  title: {
    fontSize: '33px',
    fontWeight: 200,
    textTransform: 'uppercase',
    marginTop: '0px',
    marginBottom: '25px',
    letterSpacing: '3px',
    textAlign: 'center',
  },
  subTitle: {
    fontWeight: 600,
    marginBottom: '10px',
  },
  description: {
    fontSize: '16px',
    fontWeight: 200,
    marginTop: '0px',
    marginBottom: '25px',
  },
  link: {
    textDecoration: 'none',
    borderBottom: '1px dashed #949494',
    borderRadius: '2px',
    color: 'dodgerblue',
    fontWeight: 'bold',
  },
  bodytext: {

  },
}));

export default styles;
