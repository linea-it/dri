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
            <p>
              <span>The Laborat&oacute;rio Interinstitucional de e-Astronomia (LIneA) was created in November 2010 by an agreement signed by three research institutes of the Brazilian Ministry of Science, Technology, Innovation and Communication (</span>
              <a href="http://www.mctic.gov.br/" target="_blank"><span>MCTIC</span></a>
              <span>): </span>
              <a href="http://www.lncc.br/" target="_blank"><span>Laborat&oacute;rio Nacional de Computa&ccedil;&atilde;o Cient&iacute;fica</span></a>
              <span>, </span>
              <a href="http://on.br/" target="_blank"><span>Observat&oacute;rio Nacional</span></a>
              <span>, e </span>
              <a href="https://www.rnp.br/" target="_blank"><span>Rede Nacional de Ensino e Pesquisa</span></a>
              <span>, in order to provide support for the participation of Brazilian scientists in large international programs and requiring an IT infrastructure such as SDSS, DES, DESI and LSST. In January 2020 LIneA became a private organization operating with funds made available by </span>
              <a href="http://www.finep.gov.br/" target="_blank"><span>FINEP</span></a>
              <span> and the &ldquo;</span>
              <a href="http://inct.cnpq.br/" target="_blank"><em><span>Instituto Nacional de Ciencia e Tecnologia</span></em></a>
              <span> (</span>
              <a href="https://www.linea.gov.br/3-inct-do-e-universo-2/" target="_blank"><span>INCT do e-Universo</span></a>
              <span>)&rdquo; program jointly&nbsp; funded&nbsp; by </span>
              <a href="http://www.cnpq.br/" target="_blank"><span>CNPq</span></a>
              <span> and </span>
              <a href="http://www.faperj.br/" target="_blank"><span>FAPERJ</span></a>
              <span>.</span>
            </p>
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
            <p><span>For more information see the tutorials.</span></p>
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
