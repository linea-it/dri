import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import styles from './styles';
import { envName } from '../../Services/api';

function Banner() {
  const classes = styles();

  const [enviromentName, setEnviromentName] = useState(undefined);

  useEffect(() => {
    envName().then((result) => {
      setEnviromentName(result);
    });
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
            <h1 className={classes.title}>
              DES Science Server
            </h1>
          </Grid>
          <Grid item xs={12} className={classes.subtitleContainer}>
            <Grid
              container
              justifyContent="center"
              alignItems="center"
            >
              <Grid item>
                <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="Data Release Interface" className={classes.driLogo} />
              </Grid>
              <Grid>
                <h2 className={classes.subtitle}>
                  DES Data Release 2
                  {enviromentName !== undefined && enviromentName?.toLowerCase() !== 'production' && (
                    <>
                      <br />
                      {enviromentName}
                    </>
                  )}
                </h2>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </>
  );
}

export default Banner;
