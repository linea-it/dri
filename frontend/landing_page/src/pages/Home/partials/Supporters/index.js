import React from 'react';
import Grid from '@material-ui/core/Grid';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import styles from './styles';


function Supporters() {
  const classes = styles();

  const interfaces = [
    {
      id: 1,
      title: 'CAPES',
      image: 'logo-capes.png',
      uri: 'http://www.capes.gov.br/',
    },
    {
      id: 2,
      title: 'CNPq',
      image: 'logo-cnpq.png',
      uri: 'http://cnpq.br/',
    },
    {
      id: 3,
      title: 'FAPERJ',
      image: 'logo_faperj.jpg',
      uri: 'http://www.faperj.br/',
    },
    {
      id: 4,
      title: 'Finep',
      image: 'marca-finep.jpg',
      uri: 'http://www.finep.gov.br/',
    },
    {
      id: 5,
      title: 'INCT e-Universo',
      image: 'e-universo_sans.png',
      uri: 'http://www.linea.gov.br/010-ciencia/1-projetos/3-inct-do-e-universo-2/',
    },
  ];

  // const interfacesHost = process.env.REACT_APP_INTERFACES_HOST;

  return (
    <div className={classes.root}>
      <Container>
        <Typography variant="h4" align="center" gutterBottom>
          LIneA is supported by
        </Typography>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="flex-start"
        >
          {interfaces.map((item) => (
            <Grid key={item.id} item xs={12} sm={2}>
              <CardMedia
                className={classes.media}
                component="img"
                alt={item.title}
                height="80"
                image={`${process.env.PUBLIC_URL}/img/supporters/${item.image}`}
                title={item.title}
                onClick={() => { window.open(item.uri, '_blank'); }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
}

export default Supporters;
