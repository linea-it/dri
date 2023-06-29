/* eslint-disable max-len */
import React from 'react';
import {
  Grid, Container, Typography, Breadcrumbs, Link,
} from '@material-ui/core';
import { urlLogin } from '../../Services/api';
import styles from './styles';

function AboutUs() {
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
                Welcome to Science Server!
              </Typography>

              <>
                {/* <Typography variant="subtitle1" className={classes.description}>
                  This application allows access to DES (Dark Energy Survey) data, exclusive for collaboration members.
                </Typography> */}

                <Typography variant="subtitle1" className={classes.subTitle}>
                  For DES (Dark Energy Survey) members:
                </Typography>

                <Typography variant="subtitle1" className={classes.description}>
                  This application allows you to access DES data.
                  {' '}
                  <br />
                  You can sign in using your DES database credentials.
                  {' '}
                  <br />
                  In case you have any problem or if you need to reset your password, visit
                  {' '}
                  <Link color="inherit" className={classes.link} href="https://deslabs.ncsa.illinois.edu/desaccess/login">https://deslabs.ncsa.illinois.edu/desaccess/login</Link>
                  {' '}
                  and click the `&quot;`Forgot your password?`&quot;` link to receive an email with instructions how to reset your password.
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


              {/* (Botão para login) | (Botão para voltar para a Home) */}
              {/* <Typography variant="h2" className={classes.subTitle}>
                Welcome to Science Server!
              </Typography>

              <Typography variant="subtitle1" className={classes.description}>
                This application has data that are exclusive to the DES (Dark Energy Survey) collaboration members.
                If you are not a part of this collaboration, you can access the DES public data signing up
                {' '}
                <Link color="inherit" className={classes.link} href="https://des.ncsa.illinois.edu/releases/dr1/dr1-access">here</Link>
                {' '}
                and then accessing the applications in this
                {' '}
                <Link color="inherit" className={classes.link} href="https://desportal2.cosmology.illinois.edu">link</Link>
                .
                For collaboration members, the sign in can be done using your Oracle/Easyaccess credentials. In case you have any problem or if you need to reset your password,
                {' '}
                <Link color="inherit" className={classes.link} href="https://des.ncsa.illinois.edu/help">click here</Link>
              </Typography> */}

              {/* <>
                <Button href={urlLogin} className={classes.button}>Login In</Button>
                <Button href="/" className={classes.button}>Return to homepage</Button>
              </> */}
            </div>
          </>
        </Grid>
      </Container>
    </div>
  );
}

export default AboutUs;
