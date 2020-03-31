import React from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import styles from './styles';

function Interfaces() {
  const classes = styles();

  const interfaces = [
    {
      id: 1,
      title: 'Sky Viewer',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dignissim consequat nibh, eu congue massa. Cras at placerat neque.',
      pathname: '/sky/',
      icon: 'sky_viewer.png',
      image: 'dri1.jpg',
    },
    {
      id: 2,
      title: 'Target Viwer',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dignissim consequat nibh, eu congue massa. Cras at placerat neque.',
      pathname: '/target/',
      icon: 'target_viewer.png',
      image: 'dri2.jpg',
    },
    {
      id: 3,
      title: 'User Query',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dignissim consequat nibh, eu congue massa. Cras at placerat neque.',
      pathname: '/userquery/',
      icon: 'user_query.png',
      image: 'dri3.jpg',
    },
    {
      id: 4,
      title: 'Tile Inspection',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dignissim consequat nibh, eu congue massa. Cras at placerat neque.',
      pathname: '/eyeballing/',
      icon: 'sky_viewer.png',
      image: 'dri4.jpg',
    },
  ];

  const interfacesHost = `${window.location.protocol}//${window.location.host}`;

  return (
    <div className={classes.root}>
      <Container>
        <Grid
          container
          spacing={3}
          direction="row"
          justify="center"
          alignItems="center"
        >
          {interfaces.map((item) => (
            <Grid key={item.id} item xs={12} sm={6} md={6}>
              <Card>
                <CardActionArea href={interfacesHost + item.pathname}>
                  <CardMedia
                    alt={item.title}
                    className={classes.media}
                    image={`${process.env.PUBLIC_URL}/img/${item.image}`}
                    title={item.title}
                  >
                    <Typography
                      gutterBottom
                      className={classes.titleItem}
                      variant="h5"
                      component="h2"
                    >
                      {/* <img
                        src={`${process.env.PUBLIC_URL}/img/${item.icon}`}
                        alt="Icon"
                        className={classes.icon}
                      /> */}

                      {/* <i className={`fa fa-${item.icon}`}></i> &nbsp;  */}
                      {item.title}
                    </Typography>
                  </CardMedia>
                  <CardContent>
                    <Typography variant="body2" color="textSecondary" component="p">
                      {item.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
}

export default Interfaces;
