import React from 'react';
import { Box, Container, Grid, Typography, Link, IconButton } from '@material-ui/core';
import useStyles from './styles';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import InstagramIcon from '@material-ui/icons/Instagram';
import YouTubeIcon from '@material-ui/icons/YouTube';
import FacebookIcon from '@material-ui/icons/Facebook';

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="20" height="20">
    <path fill="#263663" d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
  </svg>
);

const Footer = () => {
  const classes = useStyles();

  return (
    <footer className={classes.footer}>
      <div className={classes.footerDivider}></div>

      <Container>
        <Grid container spacing={4} alignItems="center">

          <Grid item xs={12} md={5}>
            <Box className={classes.logoContainer}>
              <img
                src="/images/linea-logo.png"
                alt="LIneA logo"
                className={classes.logo}
              />
              <Typography variant="h6" className={classes.title}>
                Associação Laboratório<br />Interinstitucional de<br />e-Astronomia LIneA
              </Typography>
            </Box>
            <Typography variant="body1" className={classes.address}>
              Av. Pastor Martin Luther King Jr, 126 - Del Castilho<br />
              Nova América Offices, Torre 3000 / sala 817.<br />
              CEP: 20765-000 – Rio de Janeiro - RJ, Brasil
            </Typography>
            <Typography variant="body1" className={classes.futureText}>
              #PeloFuturoDaCiência &nbsp; #PeloFuturoDaAstronomia
            </Typography>
          </Grid>

          <Grid item xs={12} md={1}>
            <Box className={classes.verticalDivider}></Box>
          </Grid>

          <Grid item xs={12} md={6} className={classes.partnerSection}>
            <Box>
              <Typography variant="body1" className={classes.apoioText}>
                Support:
              </Typography>
              <Link href="https://www.linea.org.br/inct#inct" target="_blank">
                <img src="/img/inct-logo.png" alt="INCT" className={classes.inctLogo} />
              </Link>
              <Link href="https://www.gov.br/capes/pt-br" target="_blank">
                <img src="/img/capes-logo.png" alt="CAPES" className={classes.partnerLogo} />
              </Link>
              <Link href="https://www.gov.br/cnpq/pt-br" target="_blank">
                <img src="/img/cnpq-logo.png" alt="CNPq" className={classes.partnerLogo} />
              </Link>
              <Link href="https://www.faperj.br" target="_blank">
                <img src="/img/faperj-logo.png" alt="FAPERJ" className={classes.partnerLogo} />
              </Link>
              <Link href="http://www.finep.gov.br" target="_blank">
                <img src="/img/finep-logo.png" alt="FINEP" className={classes.partnerLogo} />
              </Link>
            </Box>

            <Box className={classes.contactSection}>
              <Typography variant="body1" className={classes.contactInfo}>
                e-mail: <Link href="mailto:secretaria@linea.org.br" className={classes.link}>secretaria@linea.org.br</Link>
              </Typography>
              <Typography variant="body1" className={classes.contactInfo}>
                tel: <Link href="tel:+5521969379224" style={{ fontWeight: 'bold' }} className={classes.link}>+55 21 96937 9224</Link>
              </Typography>
            </Box>

            <Box className={classes.socialIcons}>
              <IconButton href="https://www.linkedin.com/company/linea-astronomia" target="_blank" className={`${classes.socialIcon} ${classes.linkedinHover}`}>
                <LinkedInIcon />
              </IconButton>
              <IconButton href="https://x.com/linea_astronomia" target="_blank" className={`${classes.socialIcon}`}>
                <XIcon />
              </IconButton>
              <IconButton href="https://www.instagram.com/linea_astronomia" target="_blank" className={`${classes.socialIcon} ${classes.instagramHover}`}>
                <InstagramIcon />
              </IconButton>
              <IconButton href="https://www.youtube.com/channel/UCxzO8x_cjv2wlfpEoP4zNXA" target="_blank" className={`${classes.socialIcon} ${classes.youtubeHover}`}>
                <YouTubeIcon />
              </IconButton>
              <IconButton href="https://www.facebook.com/linea.astronomia" target="_blank" className={`${classes.socialIcon} ${classes.facebookHover}`}>
                <FacebookIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Typography variant="body2" className={classes.bottomText}>
        LIneA - 2024 - All rights reserved | <Link href="https://www.linea.org.br/politica-de-privacidade" target="_blank" className={classes.link}>Privacy Policy</Link>
      </Typography>
    </footer>
  );
}
export default Footer;
