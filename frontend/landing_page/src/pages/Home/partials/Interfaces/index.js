/* eslint-disable import/named */
/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */
import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import styles from './styles';
import { getApplication } from '../../../../Services/api';

function Interfaces() {
  const classes = styles();
  const [interfaces, setInterfaces] = useState([]);

  useEffect(() => {
    getApplication().then((res) => {
      setInterfaces(res);
    });
  }, []);

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={2}
        direction="row"
        justify="center"
        alignItems="stretch"
      >
        {interfaces.map((item, index) => (
          <Grid key={item.id} item xs={12} sm={6} md={4} lg={2}>
            <Card>
              <CardActionArea
                href={item.app_url}
                target={item.url ? '_blanc' : '_self'}
              >
                <CardMedia
                  alt={item.app_display_name}
                  className={classes.media}
                  image={`${process.env.PUBLIC_URL}/img/dri${index}.jpg`}
                  title={item.app_display_name}
                >
                  <Typography
                    gutterBottom
                    className={classes.titleItem}
                    variant="h5"
                    component="h2"
                  >
                    {/* <i className={`fa fa-${item.icon}`}></i> &nbsp;  */}
                    {item.app_display_name}
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
    </div>
  );
}

export default Interfaces;