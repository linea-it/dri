import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import styles from './styles';
import { envName } from '../../Services/api';

function Banner() {
  const classes = styles();

  const [isBr, setIsBr] = useState(false);
  const [enviromentName, setEnviromentName] = useState(undefined);

  useEffect(() => {
    // Verifica se o site está hospedado no dominio do linea.
    if (window.location.hostname === 'scienceserver.linea.gov.br') {
      setIsBr(true);
    } else {
      setIsBr(false);
    }
    envName().then((result) => {
      console.log(result)
      setEnviromentName(result)
    })
  }, []);


  return (
    <>
      <div className={classes.root}>
        <Grid
          container
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={1}
          className={classes.container}
        >
          <Grid item xs={12} className={classes.titleWrapper}>
            <div className={classes.titleContainer}>
              <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="Data Release Interface" className={classes.driLogo} />
              <h1 className={classes.title}>
                LIneA Science Server
              </h1>
            </div>
            <h2 className={classes.subtitle}>
              Data Release 2 {enviromentName !== undefined && enviromentName.toLowerCase() !== 'production' && enviromentName}
            </h2>
            {isBr && (
              <img src={`${process.env.PUBLIC_URL}/img/bandeira_brasil.jpg`} alt="Brasil" className={classes.brFlag} />
            )}
          </Grid>
        </Grid>
      </div>
    </>
  );
}

export default Banner;
