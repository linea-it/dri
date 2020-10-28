/* eslint-disable max-len */
import React from 'react';
import {
  Grid, Container, Typography,
} from '@material-ui/core';
import styles from './styles';

function Help() {
  const classes = styles();


  return (
    <div className={classes.initContainer}>
      <Container>
        <Grid
          item
          xs={9}
          className={classes.grid}
        >
          <Typography variant="h4" align="center" gutterBottom>
            Help
          </Typography>
          <Typography
            gutterBottom
            className={classes.textFormat}
            variant="overline"
            component="h2"
          >
            <div>
              <p><b><i>About the LIneA Science Server Interface</i></b></p>
              <p><span>Currently the LIneA Science Server provides access to the following services:</span></p>
              <ol>
                <li><span>Sky viewer: display a panoramic view of DES images across its footprint.</span></li>
                <li><span>Target viewer: visualize and manage list of objects. One can rank, &nbsp;reject entries filter by properties, and create mosaics.</span></li>
                <li><span>Science products: browse scientific products produce by LIneA Science portal or DES collaboration, such as maps, VACs, and cluster catalogs.</span></li>
                <li><span>User query: allows one to query the DES database which creates temporary tables listing the results which can be immediately viewed using the Target Viewer.</span></li>
              </ol>
              <p><b><i>Credits</i></b></p>
              <p><span>We would like to thank the contribution of the following people and organizations:</span></p>
              <ol>
                <li><span>NCSA team for providing the infrastructure and tools such as which are use by Science Server</span></li>
                <li><span>E. Bertin for the use of &nbsp;VisiOmatic and for helping in its installation</span></li>
                <li><span>P. Fernique for helping in the integration of Aladin in the Science Server framework</span></li>
              </ol>
              <p><span>LIneA team:</span></p>
              <ul>
                <li><span>Luiz Nicolaci da Costa (Lead Scientist)</span></li>
                <li><span>Angelo Fausti Neto (Technical Lead)</span></li>
                <li><span>Glauber Costa</span></li>
                <li><span>Riccardo Campisano</span></li>
                <li><span>Rafael Brito</span></li>
                <li><span>Fabio Oliveira</span></li>
                <li><span>Felipe Machado</span></li>
                <li><span>Ricardo Ogando</span></li>
                <li><span>Guilherme Soares</span></li>
                <li><span>Cida Silveira</span></li>
                <li><span>Maria Luiza Sanchez</span></li>
                <li><span>Humberto Aranha</span></li>
              </ul>
            </div>
          </Typography>
        </Grid>
      </Container>
    </div>
  );
}

export default Help;
