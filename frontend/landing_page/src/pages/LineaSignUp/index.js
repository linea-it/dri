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
            <Typography color="textPrimary">Oracle/Easy access</Typography>
          </Breadcrumbs>
          <>
            <div className={classes.notfound}>

              <Typography variant="h2" className={classes.title}>
                Bem Vindo ao Science Server!
              </Typography>

              <>
                <Typography variant="subtitle1" className={classes.subTitle}>
                  For DES (Dark Energy Survey) members:
                </Typography>

                <Typography variant="subtitle1" className={classes.description}>
                  This application allows you to access DES data. You can sign in using your Oracle/Easyaccess credentials
                  {' '}
                  <br />
                  (see user/password in the .desservices.ini file in your home folder). In case you have any problem or if you need to reset your password,
                  {' '}
                  <Link color="inherit" className={classes.link} href="https://des.ncsa.illinois.edu/help">click here</Link>
                  .
                </Typography>

                <Typography variant="subtitle1" className={classes.subTitle}>
                  For non-DES members:
                </Typography>

                <Typography variant="subtitle1" className={classes.description}>
                  You can access the DES public data signing up
                  {' '}
                  <Link color="inherit" className={classes.link} href="https://des.ncsa.illinois.edu/releases/dr2/dr2-access">here</Link>
                  {' '}
                  and then accessing the applications in this
                  {' '}
                  <Link color="inherit" className={classes.link} href="https://desportal2.cosmology.illinois.edu">link</Link>
                  .
                  .
                </Typography>

                <Typography variant="subtitle1" className={classes.description}>
                  Continue to
                  {' '}
                  <Link color="inherit" className={classes.link} href={urlLogin}>login</Link>
                  {' '}
                  or
                  {' '}
                  <Link color="inherit" className={classes.link} href="/">return to the home page</Link>
                  .
                </Typography>
              </>

            </div>
            <div className={classes.notfound}>

              <Typography variant="h2" className={classes.title}>
                Welcome to Science Server!
              </Typography>

              <>

                <Typography variant="subtitle1" className={classes.subTitle}>
                  For DES (Dark Energy Survey) members:
                </Typography>

                <Typography variant="subtitle1" className={classes.description}>
                  This application allows you to access DES data. You can sign in using your Oracle/Easyaccess credentials
                  {' '}
                  <br />
                  (see user/password in the .desservices.ini file in your home folder). In case you have any problem or if you need to reset your password,
                  {' '}
                  <Link color="inherit" className={classes.link} href="https://des.ncsa.illinois.edu/help">click here</Link>
                  .
                </Typography>

                <Typography variant="subtitle1" className={classes.subTitle}>
                  For non-DES members:
                </Typography>

                <Typography variant="subtitle1" className={classes.description}>
                  You can access the DES public data signing up
                  {' '}
                  <Link color="inherit" className={classes.link} href="https://des.ncsa.illinois.edu/releases/dr2/dr2-access">here</Link>
                  {' '}
                  and then accessing the applications in this
                  {' '}
                  <Link color="inherit" className={classes.link} href="https://desportal2.cosmology.illinois.edu">link</Link>
                  .
                  .
                </Typography>

                <Typography variant="subtitle1" className={classes.description}>
                  Continue to
                  {' '}
                  <Link color="inherit" className={classes.link} href={urlLogin}>login</Link>
                  {' '}
                  or
                  {' '}
                  <Link color="inherit" className={classes.link} href="/">return to the home page</Link>
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
