/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-len */
import React from 'react';
import {
  Grid, Container, Typography, Breadcrumbs, Link, Card, CardContent, Box,
} from '@material-ui/core';
import styles from './styles';

function Contact() {
  const classes = styles();
  return (
    <Box className={classes.initContainer}>
      <Container maxWidth='lg'>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link color='inherit' href='/'>
            Home
          </Link>
          <Typography color='textPrimary'>Contact</Typography>
        </Breadcrumbs>
        <Grid item xs={9} className={classes.grid}>
          <Card sx={{ margin: '16px 0' }}>
            <CardContent>
              <Typography variant='h4' align='center' color='textPrimary'>
                Contact
              </Typography>
              <p>
                <span>
                  If you have any problems related to the usage of the applications,
                  <Link href='/tutorials' variant='body2'>
                    &nbsp;click here&nbsp;
                  </Link>
                  <br />
                  <p>To get in touch with technical support you can send an email to: helpdesk at linea dot org dot br</p>
                  We stand ready to assist you with any inquiries, ideas, or remarks you may have.
                </span>
              </p>
            </CardContent>
          </Card>
        </Grid>
      </Container>
    </Box>
  );
}

export default Contact;
