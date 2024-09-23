import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  footer: {
    backgroundColor: '#F4F4F4',
    color: '#000',
    padding: theme.spacing(4, 0),
  },
  footerDivider: {
    width: '100%',
    maxWidth: '1000px',
    height: '0.5px',
    backgroundColor: '#ccc',
    margin: '0 auto',
    marginBottom: theme.spacing(12),
  },
  verticalDivider: {
    height: '110px',
    width: '0.5px',
    backgroundColor: '#ccc',
    margin: '0 auto',
    position: 'relative',
    top: '-80px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: theme.spacing(4),
  },
  logo: {
    width: '145px',
    height: '120px',
    marginRight: theme.spacing(2),
  },
  title: {
    fontSize: '24px',
    color: '#000',
    fontWeight: 'normal',
    paddingLeft: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
  address: {
    fontSize: '14px',
    color: '#000',
    marginTop: theme.spacing(6),
    paddingLeft: theme.spacing(10),
  },
  futureText: {
    marginTop: theme.spacing(4),
    background: '-webkit-linear-gradient(120deg, #0989cb, #31297f)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '16px',
    fontWeight: 'normal',
    textAlign: 'left',
    paddingLeft: theme.spacing(6),
    wordSpacing: '0.8rem',
  },
  partnerSection: {
    textAlign: 'left',
    marginBottom: theme.spacing(2),
  },
  apoioText: {
    color: '#a3a3a3',
    fontSize: '.9rem',
    textAlign: 'left',
  },
  partnerLogo: {
    width: '100px',
    height: '60px',
    margin: theme.spacing(1.5),
    filter: 'grayscale(100%)',
    transition: 'filter 0.3s ease',
    '&:hover': {
      filter: 'grayscale(0%)',
    },
  },
  inctLogo: {
    width: '60px',
    height: '60px',
    margin: theme.spacing(1.5),
    filter: 'grayscale(100%)',
    transition: 'filter 0.3s ease',
    '&:hover': {
      filter: 'grayscale(0%)',
    },
  },
  contactSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(6),
  },
  contactInfo: {
    marginRight: theme.spacing(2),
  },
  socialIcons: {
    marginTop: theme.spacing(1),
    display: 'flex',
    justifyContent: 'center',
  },
  socialIcon: {
    width: '48px',
    height: '48px',
    color: '#283664',
    transition: 'color 0.3s ease',
    '&:hover': {
      color: '#000',
    },
  },
  linkedinHover: {
    '&:hover': {
      color: '#0077B5',
    },
  },
  instagramHover: {
    '&:hover': {
      color: '#E1306C',
    },
  },
  youtubeHover: {
    '&:hover': {
      color: '#FF0000',
    },
  },
  facebookHover: {
    '&:hover': {
      color: '#1877F2',
    },
  },
  bottomText: {
    textAlign: 'center',
    color: '#a3a3a3',
    fontSize: '0.875rem',
    marginTop: theme.spacing(5),
  },
  link: {
    color: '#000',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
}));

export default useStyles;
