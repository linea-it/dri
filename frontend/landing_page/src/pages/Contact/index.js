/* eslint-disable max-len */
import React, { useState } from 'react';
import {
  Grid, Container, Typography, TextField, Button, Breadcrumbs, Link,
} from '@material-ui/core';
import EmailIcon from '@material-ui/icons/Email';
import styles from './styles';
import { sendEmail } from '../../Services/api';

function Contact() {
  const classes = styles();

  const [formData, setformData] = useState({
    name: '', from: '', subject: '', message: '',
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    sendEmail(formData).then((res) => {
      console.log(res);
    });
  };

  return (
    <div className={classes.initContainer}>
      <Container>
        <Grid item xs={12}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/">
              Home
            </Link>
            <Typography color="textPrimary">Contact</Typography>
          </Breadcrumbs>
          <Grid item xs={6} className={classes.grid}>
            <Typography variant="h3" align="center" color="textPrimary">Contact</Typography>
            <p>
              <span>
                If you have any problems related to the usage of the applications,
                <Link href="/tutorials" variant="body2">
                &nbsp;click here&nbsp;
                </Link>
                to be redirected to the tutorials page.
                Or if you still have questions, suggestions or complaints, you can contact us using the form below.
              </span>
            </p>
            <br />
            <form
              autoComplete="off"
              onSubmit={handleSubmit}
            >
              <div className={classes.textFields}>
                <TextField
                  required
                  id="textFieldName"
                  type="text"
                  variant="outlined"
                  value={formData.name}
                  onChange={(event) => setformData({ ...formData, name: event.target.value })}
                  label="Name"
                  placeholder="Name"
                  fullWidth
                  size="small"
                />
              </div>

              <div className={classes.textFields}>
                <TextField
                  required
                  id="textFieldEmail"
                  type="email"
                  variant="outlined"
                  value={formData.from}
                  onChange={(event) => setformData({ ...formData, from: event.target.value })}
                  label="Email"
                  placeholder="Email"
                  fullWidth
                  size="small"
                />
              </div>

              <div className={classes.textFields}>
                <TextField
                  required
                  id="textFieldSubject"
                  type="text"
                  variant="outlined"
                  value={formData.subject}
                  onChange={(event) => setformData({ ...formData, subject: event.target.value })}
                  label="Subject"
                  placeholder="Subject"
                  fullWidth
                  size="small"
                />
              </div>

              <div className={classes.textFields}>
                <TextField
                  required
                  id="textFieldMessage"
                  type="text"
                  variant="outlined"
                  value={formData.message}
                  onChange={(event) => setformData({ ...formData, message: event.target.value })}
                  multiline
                  rows="8"
                  rowsMax="8"
                  fullWidth
                  size="small"
                  label="Message"
                  placeholder="Message"
                />
              </div>

              <Grid container alignItems="flex-end">
                <Grid item xs={10} />
                <Grid item xs={2}>
                  <Button variant="contained" color="primary" type="submit" disableElevation>
                    <EmailIcon />
                    &nbsp;Submit
                  </Button>
                </Grid>
              </Grid>

            </form>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default Contact;
