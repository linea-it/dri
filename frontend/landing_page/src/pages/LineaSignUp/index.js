/* eslint-disable max-len */
import React from 'react';
import {
  Grid, Container, Typography, Breadcrumbs, Link,
} from '@material-ui/core';
import { urlLogin } from '../../Services/api';
import styles from './styles';

function SignUp() {
  const classes = styles();

  return (
    <div className={classes.initContainer}>
      <Container>
        <Grid
          item
          xs={12}
        >
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/">
              Home
            </Link>
            <Typography color="textPrimary">Sign Up</Typography>
          </Breadcrumbs>
          <>
            <div className={classes.notfound}>

              <Typography variant="h2" className={classes.title}>
                Bem Vindo ao Science Server!
              </Typography>

              <>
                {/* <Typography variant="subtitle1" className={classes.subTitle}>
                  For DES (Dark Energy Survey) members:
                </Typography> */}

                <Typography variant="subtitle1" className={classes.description}>
                  Para ter acesso aos dados do DES Data Release
                  {' '}
                  <br />
                  Você pode se registrar utilizando sua conta Google clicando neste link
                  {' '}
                  <Link color="inherit" className={classes.link} href="https://scienceserver.linea.gov.br/Shibboleth.sso/Login?target=https://scienceserver.linea.gov.br/dri/api/shib/?next=/&entityID=https://satosa.linea.gov.br/linea/proxy/aHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29t">SignUp</Link>
                  .
                </Typography>

                <Typography variant="subtitle1" className={classes.description}>
                  Se você já é cadastrado acesse a página de
                  {' '}
                  <Link color="inherit" className={classes.link} href={urlLogin}>login</Link>
                  {' '}
                  ou
                  {' '}
                  <Link color="inherit" className={classes.link} href="/">retorne para a home page</Link>
                  .
                </Typography>
              </>
            </div>
          </>
        </Grid>
      </Container>
    </div>
  );
}

export default SignUp;
