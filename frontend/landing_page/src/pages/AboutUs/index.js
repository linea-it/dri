/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react/style-prop-object */
/* eslint-disable react/jsx-indent */
/* eslint-disable max-len */
import React from 'react';
import {
  Grid, Container, Typography, Breadcrumbs, Link,
} from '@material-ui/core';
import styles from './styles';

function AboutUs() {
  const classes = styles();
  return (
    <div className={classes.initContainer}>
      <Container>
        <Grid
          item
          xs={12}
          className={classes.grid}
        >
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/">
              Home
            </Link>
            <Typography color="textPrimary">About</Typography>
          </Breadcrumbs>
          <Typography
            gutterBottom
            className={classes.textFormat}
            variant="overline"
            component="h2"
          >
            <Grid
              item
              md={7}
              sm={10}
              className={classes.grid}
            >
              <div>
                <p><strong><em>About us</em></strong></p>
                <p>LIneA - Laboratório Interinstitucional de e-Astronomia - is a multi-user laboratory operated by a non-profit organization (LIneA Association) with financial support predominantly from the Brazilian Ministry of Science, Technology, and Innovation. Our mission is to partner with the <a href="https://www.linea.org.br/inct#inct" target='_blank' rel='noopener'>INCT of e-Universe</a> to support the Brazilian astronomical community with computational infrastructure and expertise in big data analysis to provide technical conditions for participation in major astronomical surveys such as <em>Sloan Digital Sky Survey</em> <a href="https://www.sdss.org" target='_blank' rel='noopener'>(SDSS)</a>, <em>Dark Energy Survey</em> <a href="https://www.darkenergysurvey.org" target='_blank' rel='noopener'> (DES)</a>, and <em>Legacy Survey of Space and Time</em> <a href="https://rubinobservatory.org" target='_blank' rel='noopener'>(LSST)</a>. To learn more, check out the video <a href="https://youtu.be/jC-k85tfd0Y" target='_blank' rel='noopener'>"Conheça o LIneA"</a> on our <a href="https://www.youtube.com/@linea_org" target='_blank' rel='noopener'>YouTube channel</a> or browse our <a href="https://linea.org.br/" target='_blank' rel='noopener'>official website</a>.</p>
                <p><span>Some of its main projects for DES include:</span></p>
                <ol>
                  <li>
                    <span>The </span>
                    <strong>Quick Reduce</strong>
                    <span>, a pipeline available at CTIO to assess the quality of the images gathered by DECam;</span>
                  </li>
                  <li>
                    <span>The </span>
                    <strong>DES Science Portal</strong>
                    <span>, a web-based science platform that integrates pipelines used to create value-added catalogs to feed a variety of science analysis workflows;</span>
                  </li>
                  <li>
                    <span>The </span>
                    <strong>LIneA Data Server</strong>
                    <span>, an interface available at Fermilab since April 2014 to enable the visualization of images and catalogs, and to carry out queries in the DESDM database.</span>
                  </li>
                  <li>
                    <span>The </span>
                    <strong>LIneA Science Server</strong>
                    <span>, an improved version of the Data Server available at NCSA since the first public release of DES data release.</span>
                  </li>
                </ol>
                <p><strong><em>About the LIneA Science Server Interface</em></strong></p>
                <p><span>Currently the LIneA Science Server provides access to the following services:</span></p>
                <ul>
                  <li>
                    <strong>Sky viewer:</strong>
                    <span> display a panoramic view of DES images across its footprint.</span>
                  </li>
                  <li>
                    <strong>Target viewer</strong>
                    <span>: a tool to visualize and manage list of objects. One can rank, reject entries, filter by properties, and create mosaics.</span>
                  </li>
                  <li>
                    <strong>User query:</strong>
                    <span> it allows one to query the DES database which creates temporary tables, listing the results which can be immediately viewed using the Target Viewer.</span>
                  </li>
                  <li>
                    <strong>Tile Inspection:</strong>
                    <span> to quickly examine and validate coadded images, only available for members of the collaboration.</span>
                  </li>
                </ul>
                <p><span>For more information see the <a href="https://docs.linea.org.br" target="_blank">documentation</a> and <a href="https://scienceserver-dev.linea.org.br/tutorials" target="_blank">video tutorials</a>.</span></p>
                <p><strong><em>Credits</em></strong></p>
                <p><span>We would like to thank the contribution of the following people and organizations</span></p>
                <ul>
                  <li><span>NCSA team for providing the infrastructure and some of the tools used by the Science Server</span></li>
                  <li><span>E. Bertin for the use of VisiOmatic and for helping in its installation</span></li>
                  <li><span>P. Fernique for helping in the integration of Aladin in the Science Server framework</span></li>
                  <li><span>Cristiano Singulani (Technical Lead of the DES Science Portal)&nbsp;</span></li>
                  <li><span>Glauber Costa (Technical Lead of the LIneA Science Server)</span></li>
                  <li><span>Current and past LIneA IT team members.</span></li>
                </ul>
              </div>
            </Grid>
          </Typography>
        </Grid>
      </Container>
    </div>
  );
}

export default AboutUs;
