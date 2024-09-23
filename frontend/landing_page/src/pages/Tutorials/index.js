/* eslint-disable max-len */
/* eslint-disable eqeqeq */
import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import {
  Container,
  Typography,
  Grid,
  ExpansionPanel,
  ExpansionPanelSummary,
  ListItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link,
} from '@material-ui/core';
import MovieIcon from '@material-ui/icons/Movie';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import styles from './styles';
import { tutorials } from '../../Services/api';

function Tutorials() {
  const classes = styles();
  const opts = { width: '100%' };
  const [idPlayer, setIdPlayer] = useState('');
  const [videoOnDisplay, setVideoOnDisplay] = useState({ tutorial: '', video: '' });
  const [treeTutorial, setTreeTutorial] = useState([]);

  function compare(a, b) {
    const bandA = a.title.toUpperCase();
    const bandB = b.title.toUpperCase();
    let comparison = 0;
    if (bandA > bandB) {
      comparison = 1;
    } else if (bandA < bandB) {
      comparison = -1;
    }
    return comparison;
  }

  useEffect(() => {
    const auxTreeTutorial = [];
    let menuFilter; let idVideo;
    async function fetchData() {
      tutorials().then((resTutorials) => {
        resTutorials.forEach((elem) => {
          idVideo = elem.ttr_src.substring(30, elem.ttr_src.length);
          menuFilter = auxTreeTutorial.filter((e) => e.title == elem.application_display_name);
          if (auxTreeTutorial.filter((e) => e.title == elem.application_display_name).length > 0) {
            menuFilter[0].videos.push({ title: elem.ttr_title, idVideo, description: elem.ttr_description });
          } else {
            auxTreeTutorial.push({ title: elem.application_display_name, videos: [{ title: elem.ttr_title, idVideo, description: elem.ttr_description }] });
          }
        });
        // setVideoOnDisplay({ tutorial: response.data[0].application_display_name, video: response.data[0].ttr_title });
        setIdPlayer('0');
      });
    }
    setTreeTutorial(auxTreeTutorial);
    fetchData();
  }, []);

  const [expanded, setExpanded] = React.useState('');
  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };
  const handleSelected = (tutorial, video) => {
    setIdPlayer(video.idVideo);
    setVideoOnDisplay({ tutorial: tutorial.title, video: video.title });
  };

  return (
    <div className={classes.initContainer}>
      <Container>
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/">
            Home
          </Link>
          <Typography color="textPrimary">Tutorials</Typography>
        </Breadcrumbs>
        <Grid
          container
          spacing={9}
          direction="row"
          justify="space-evenly"
          alignItems="flex-start"
          className={classes.root}
        >
          <Grid item xs={12} sm={4}>
            {treeTutorial && treeTutorial.sort(compare).map((tutorial, index) => (
              <ExpansionPanel
                square
                key={(index + 1).toString()}
                expanded={expanded === `panel${index + 1}`}
                onChange={handleChange(`panel${index + 1}`)}
              >
                <ExpansionPanelSummary aria-controls={`panel${index + 1}d-content`} id={`panel${index + 1}d-header`}>
                  {((expanded === `panel${index + 1}`) ? <ArrowDropDownIcon /> : <ArrowRightIcon />)}
                  <Typography>{tutorial.title}</Typography>
                </ExpansionPanelSummary>
                {tutorial.videos.map((video, indexVideos) => (
                  <ListItem
                    key={(index + 1).toString() + (indexVideos + 1).toString()}
                    className={classes.item}
                    onClick={() => { handleSelected(tutorial, video); }}
                  >
                    <ListItemIcon>
                      <MovieIcon />
                    </ListItemIcon>
                    <ListItemText primary={video.title} />
                  </ListItem>
                ))}
              </ExpansionPanel>
            ))}
          </Grid>
          <Grid item xs={12} sm={8}>
            { idPlayer != '0'
              ? (
                <>
                  <YouTube
                    videoId={idPlayer}
                    opts={opts}
                  />
                  <Typography variant="subtitle1" align="center" gutterBottom>
                    {`${videoOnDisplay.tutorial} - ${videoOnDisplay.video}`}
                  </Typography>
                </>
              )
              : ''}
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default Tutorials;
