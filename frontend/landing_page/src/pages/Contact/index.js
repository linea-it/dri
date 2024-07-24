/* eslint-disable react/no-unescaped-entities */
/* eslint-disable max-len */
import React, { useRef, useState } from 'react';
import {
  Grid, Container, Typography, TextField, Button, Breadcrumbs, Link, Snackbar,
} from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import EmailIcon from '@material-ui/icons/Email';
import ReCAPTCHA from 'react-google-recaptcha';
import styles from './styles';
import { sendEmail } from '../../Services/api';

function Contact() {
  const classes = styles();

  const formRef = useRef();
  const recaptchaRef = useRef();

  const recaptchaKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

  const [openSnackbar, setOpenSnackbar] = useState('');
  const [submitEnabled, setSubmitEnabled] = useState(!recaptchaKey);

  const handleCloseSnackbar = () => {
    setOpenSnackbar('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (submitEnabled) {
      const formData = {
        name: formRef.current.name.value,
        subject: formRef.current.subject.value,
        from: formRef.current.from.value,
        message: formRef.current.message.value,
      };

      sendEmail(formData).then((res) => {
        if (res.status === 200) {
          setOpenSnackbar('success');
          formRef.current.reset();
          recaptchaRef.current.reset();
          setSubmitEnabled(false);
        } else if (res.status === 403) {
          setOpenSnackbar('unauthorized');
        } else {
          setOpenSnackbar('unexpected');
        }
      });
    }
  };

  const handleRecaptchaChange = (value) => {
    if (value) {
      setSubmitEnabled(true);
    } else {
      setSubmitEnabled(false);
    }
  };

  return (
    <div className={classes.initContainer}>
      <Container maxWidth="md">
        <Grid container spacing={3} justify="center">
          <Grid item xs={12}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link color="inherit" href="/">
                Home
              </Link>
              <Typography color="textPrimary">Contact</Typography>
            </Breadcrumbs>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h3" align="center" color="textPrimary">Contact</Typography>
            <p>
              If you have any problems related to the usage of the applications,
              <Link href="/tutorials" variant="body2">
                &nbsp;click here&nbsp;
              </Link>
              to be redirected to the tutorials page.
              Or if you still have questions, suggestions or complaints, you can contact us using the form below.
            </p>
          </Grid>
          <Grid item xs={12} md={8}>
            <form ref={formRef} autoComplete="off" onSubmit={handleSubmit}>
              <div className={classes.textFields}>
                <TextField
                  required
                  id="name"
                  type="text"
                  variant="outlined"
                  label="Name"
                  placeholder="Name"
                  fullWidth
                  size="small"
                />
              </div>

              <div className={classes.textFields}>
                <TextField
                  required
                  id="from"
                  type="email"
                  variant="outlined"
                  label="Email"
                  placeholder="Email"
                  fullWidth
                  size="small"
                />
              </div>

              <div className={classes.textFields}>
                <TextField
                  required
                  id="subject"
                  type="text"
                  variant="outlined"
                  label="Subject"
                  placeholder="Subject"
                  fullWidth
                  size="small"
                />
              </div>

              <div className={classes.textFields}>
                <TextField
                  required
                  id="message"
                  type="text"
                  variant="outlined"
                  multiline
                  rows="8"
                  fullWidth
                  size="small"
                  label="Message"
                  placeholder="Message"
                />
              </div>

              {recaptchaKey && (
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={recaptchaKey}
                  onChange={handleRecaptchaChange}
                />
              )}

              <Grid container justify="center" className={classes.submitButton}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={!submitEnabled}
                  startIcon={<EmailIcon />}
                  style={{ marginTop: 5 }}
                >
                  Submit
                </Button>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={openSnackbar === 'success'}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          <AlertTitle>Success</AlertTitle>
          Your message was sent! A ticket was opened on our issue tracking system and you'll receive a feedback when it gets approved.
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={openSnackbar === 'unauthorized'}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="warning">
          <AlertTitle>Unauthorized</AlertTitle>
          Sorry, you have to be authenticated in this application to send a message. In case you still need to contact us, {' '}
          <Link href="https://www.linea.org.br/6-faleconosco/" target="_blank">
            click here
          </Link>
          {' '} to go to the "Contact Us" page on our website.
        </Alert>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={openSnackbar === 'unexpected'}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          <AlertTitle>Unexpected Error</AlertTitle>
          Sorry, an unexpected error has occurred. Could you please try again? If it still didn't work, you can {' '}
          <Link href="https://www.linea.org.br/6-faleconosco/" target="_blank">
            click here
          </Link>
          {' '} to go to the "Contact Us" page on our website.
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Contact;
