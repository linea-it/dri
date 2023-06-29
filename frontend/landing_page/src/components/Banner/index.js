import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { YouTube, Twitter, GitHub } from '@material-ui/icons';
import styles from './styles';
import { envName } from '../../Services/api';

function Banner() {
  const classes = styles();

  const handlerClick = (socialMedia) => {
    let uri = '';
    switch (socialMedia) {
      case 'YouTube':
        uri = 'https://www.youtube.com/user/lineamcti';
        break;
      case 'Twitter':
        uri = 'https://twitter.com/LIneA_mcti';
        break;
      case 'GitHub':
        uri = 'https://github.com/linea-it/dri';
        break;
      default:
        uri = 'https://www.youtube.com/user/lineamcti';
    }
    window.open(uri, '_blank');
  };

  const [isBr, setIsBr] = useState(false);
  const [enviromentName, setEnviromentName] = useState(undefined);

  useEffect(() => {
    // Verifica se o site está hospedado no dominio do linea.
    if (window.location.hostname === 'scienceserver.linea.gov.br') {
      setIsBr(true);
    } else {
      setIsBr(false);
    }
    envName().then((result) => setEnviromentName(result.ENVIRONMENT_NAME));
  }, []);


  return (
    <>
      <div className={classes.root}>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="flex-start"
          spacing={1}
          className={classes.container}
        >
          <Grid item xs={12} className={classes.titleWrapper}>
            <table className={classes.table}>
              <tbody>
                <tr>
                  <td colSpan={2} style={{ textAlign: '-webkit-center' }}>
                    <h1 className={classes.title}>
                      LIneA Science Server
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td className={classes.positionTitle}>
                    <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="Data Release Interface" className={classes.driLogo} />
                    <h1 className={classes.subtitle}>
                      DES Data Release
                      {enviromentName && { enviromentName }}
                    </h1>
                    {isBr ? (<img src={`${process.env.PUBLIC_URL}/img/bandeira_brasil.jpg`} alt="Brasil" className={classes.brFlag} />) : ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </Grid>
          <div className={classes.floarRight}>
            <div className={classes.separatorToolBar} />
            <IconButton
              onClick={() => { handlerClick('Youtube'); }}
              color="inherit"
              aria-label="YouTube"
              component="span"
            >
              <YouTube />
            </IconButton>
            <IconButton
              onClick={() => { handlerClick('Twitter'); }}
              color="inherit"
              aria-label="Twitter"
              component="span"
            >
              <Twitter />
            </IconButton>
            <IconButton
              onClick={() => { handlerClick('GitHub'); }}
              color="inherit"
              aria-label="GitHub"
              component="span"
            >
              <GitHub />
            </IconButton>
          </div>
        </Grid>
      </div>
    </>
  );
}

export default Banner;
