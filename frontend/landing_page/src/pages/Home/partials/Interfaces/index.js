/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */
import React from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
// import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
// import CardActions from '@material-ui/core/CardActions';
import styles from './styles';
// import DialogCard from '../ModalInterfaces';

function Interfaces() {
  const classes = styles();

  const interfaces = [
    {
      id: 1,
      title: 'Sky Viewer',
      // description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dignissim consequat nibh, eu congue massa. Cras at placerat neque.',
      pathname: '/sky/',
      icon: 'sky_viewer.png',
      image: 'dri1.jpg',
    },
    {
      id: 2,
      title: 'Target Viewer',
      // description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dignissim consequat nibh, eu congue massa. Cras at placerat neque.',
      pathname: '/target/',
      icon: 'target_viewer.png',
      image: 'dri2.jpg',
    },
    {
      id: 3,
      title: 'Tile Inspection',
      // description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dignissim consequat nibh, eu congue massa. Cras at placerat neque.',
      pathname: '/eyeballing/',
      icon: 'sky_viewer.png',
      image: 'dri4.jpg',
    },
    {
      id: 4,
      title: 'User Query',
      // description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque dignissim consequat nibh, eu congue massa. Cras at placerat neque.',
      pathname: '/userquery/',
      icon: 'user_query.png',
      image: 'dri3.jpg',
    },
  ];

  return (
    <div className={classes.root}>
      <Container>
        <Grid
          container
          spacing={2}
          direction="row"
          justify="center"
          alignItems="stretch"
        >
          {interfaces.map((item) => (
            <Grid key={item.id} item xs={12} sm={6} md={3}>
              <Card>
                <CardActionArea
                  href={item.pathname}
                  target={item.url ? '_blanc' : '_self'}
                >
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
                      {/* <i className={`fa fa-${item.icon}`}></i> &nbsp;  */}
                      {item.title}
                    </Typography>
                  </CardMedia>
                  {/* <CardContent className={classes.cardContent}>
                    <Typography variant="body2" color="textSecondary" component="div" className={classes.description}>
                      {item.description}
                    </Typography>
                  </CardContent> */}
                </CardActionArea>
                {/* <CardActions className={classes.dialogCard}>
                  {item.description.length > 80 ? <DialogCard item={item} /> : '' }
                </CardActions> */}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
}

export default Interfaces;
