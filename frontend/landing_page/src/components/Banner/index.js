import React from 'react';
import Grid from '@material-ui/core/Grid';
// import Typography from '@material-ui/core/Typography';
import styles from './styles';

function Banner() {
  const classes = styles();

  return (
    <>
      <div className={classes.root}>
        <Grid
          container
          direction="row"
          justify="space-between"
          alignItems="flex-start"
          spacing={1}
          className={classes.container}
        >
          <Grid item xs={12} className={classes.titleWrapper}>
            <table className={classes.table}>
              <tbody>
                <tr>
                  <td>
                    <img src={`${process.env.PUBLIC_URL}/img/logo.png`} alt="Data Release Interface" className={classes.desLogo} />
                  </td>
                  <td className={classes.positionTitle}>
                    <h1 className={classes.title}>
                      Data Release Interface
                    </h1>
                    <h2 className={classes.subtitle}>
                      Science Server
                    </h2>
                  </td>
                </tr>
              </tbody>
            </table>
            {/* <Grid item xs={12} sm={10} md={8} className={classes.descriptionWrapper}>
              <Typography variant="body2" component="p">
                An international, collaborative effort to map hundreds of millions of galaxies,
                detect thousands of supernovae,
                and find patterns of cosmic structure
                that will reveal the nature of the mysterious dark energy
                that is accelerating the expansion of our Universe.
                DES began searching the Southern skies on August 31, 2013.
              </Typography>
            </Grid> */}
          </Grid>
        </Grid>
      </div>
    </>
  );
}

export default Banner;
