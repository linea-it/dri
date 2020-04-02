/* eslint-disable array-callback-return */
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
} from '@material-ui/core';
import MovieIcon from '@material-ui/icons/Movie';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import styles from './styles';
import api from '../../Services/api';


function Tutorials() {
  const classes = styles();
  const opts = { width: '100%' };
  const [idPlayer, setIdPlayer] = useState('');
  const [videoOnDisplay, setVideoOnDisplay] = useState({ tutorial: '', video: '' });
  const [treeTutorial, setTreeTutorial] = useState([]);
  const auxTreeTutorial = [];
  useEffect(() => {
    let menuFilter; let idVideo;
    async function fetchData() {
      const response = await api.get('tutorial/');
      response.data.map((elem) => {
        idVideo = elem.ttr_src.substring(30, elem.ttr_src.length);
        menuFilter = auxTreeTutorial.filter((e) => e.title == elem.application_display_name);
        if (auxTreeTutorial.filter((e) => e.title == elem.application_display_name).length > 0) {
          menuFilter[0].videos.push({ title: elem.ttr_title, idVideo, description: elem.ttr_description });
        } else {
          auxTreeTutorial.push({ title: elem.application_display_name, videos: [{ title: elem.ttr_title, idVideo, description: elem.ttr_description }] });
        }
      });
      setVideoOnDisplay({ tutorial: response.data[0].application_display_name, video: response.data[0].ttr_title });
      setIdPlayer(response.data[0].ttr_src.substring(30, response.data[0].ttr_src.length));
    }
    setTreeTutorial(auxTreeTutorial);
    fetchData();
  }, []);


  const [expanded, setExpanded] = React.useState('panel1');
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
        <Typography variant="h4" align="center" gutterBottom>
          Tutorials
        </Typography>
        <Grid
          container
          spacing={9}
          direction="row"
          justify="space-evenly"
          alignItems="flex-start"
          className={classes.root}
        >
          <Grid item xs={4} sm={4}>
            {treeTutorial && treeTutorial.map((tutorial, index) => (
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
          <Grid item xs={8} sm={8}>
            <YouTube
              videoId={idPlayer}
              opts={opts}
            />
            <Typography variant="subtitle1" align="center" gutterBottom>
              {`${videoOnDisplay.tutorial} - ${videoOnDisplay.video}`}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default Tutorials;
