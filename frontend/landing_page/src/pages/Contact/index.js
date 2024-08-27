/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-len */
import React from 'react';
import {
  Grid, Container, Typography, Breadcrumbs, Link, Card, CardContent, Box,
} from '@material-ui/core';
import styles from './styles';

function Contact() {
  const classes = styles();
  
  const user = 'helpdesk';
  const domain = 'linea.org.br';
  
  const email = `${user}@${domain}`;
  
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
              <p>To get in touch with technical support, send an email to: <a href={`mailto:${email}`}>{email}</a></p>
            </CardContent>
          </Card>
        </Grid>
      </Container>
    </Box>
  );
}

export default Contact;