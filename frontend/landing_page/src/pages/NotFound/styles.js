import { makeStyles } from '@material-ui/core/styles';

const styles = makeStyles((theme) => ({
  initContainer: theme.initContainer,
  notfound: {
    textAlign: 'center',
    paddingTop: '10vh',
  },
  title: {
    fontSize: '186px',
    fontWeight: 200,
  },
  subTitle: {
    fontSize: '33px',
    fontWeight: 200,
    textTransform: 'uppercase',
    marginTop: '0px',
    marginBottom: '25px',
    letterSpacing: '3px',
  },
  description: {
    fontSize: '16px',
    fontWeight: 200,
    marginTop: '0px',
    marginBottom: '25px',
  },
  icon: {
    border: '1px solid #949494',
    margin: '10px',
  },
  returnPage: {
    fontWeight: 200,
    textDecoration: 'none',
    borderBottom: '1px dashed #949494',
    borderRadius: '2px',
  },
}));

export default styles;
