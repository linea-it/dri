import React from 'react';
import { CardMedia,Typography, Grid } from '@material-ui/core';
import styles from './styles';


function Supporters() {
  const classes = styles();

  const interfaces = [
    {
      id: 0,
      title: 'Capes',
      image: 'capes.png',
    },
    {
      id: 1,
      title: 'CNPq',
      image: 'cnpq.png',
    },
    {
      id: 2,
      title: 'FAPERJ',
      image: 'faperj.png',
    },
    {
      id: 3,
      title: 'Finep',
      image: 'finep.png',
    },
    {
      id: 4,
      title: 'INCT do Universo',
      image: 'e-universo.png',
    },

  ];
  return (
    <div className={classes.root}>
      <Typography variant="h6" align="center" gutterBottom>
        LIneA is supported by
      </Typography>
      <Grid
        container
        spacing={2}
        direction="row"
        justify="center"
        alignItems="stretch"
      >
        {interfaces.map((item) => (
            <Grid key={item.id} item>
              <CardMedia
                className={classes.carouselItem}
                component="img"
                alt={item.title}
                image={`${process.env.PUBLIC_URL}/img/supporters/${item.image}`}
                title={item.title}
              />
            </Grid>
          ))}
      </Grid>
    </div>
  );
}

export default Supporters;
