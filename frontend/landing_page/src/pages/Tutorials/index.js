import React, { useState } from 'react';
import YouTube from 'react-youtube';
import { Container, Typography, Grid } from '@material-ui/core';
import { TreeView, TreeItem } from '@material-ui/lab';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import styles from './styles';


function Tutorials() {
  const classes = styles();

  const [idPlayer, setIdPlayer] = useState('7VfilGzeCyg');
  const opts = { width: '100%' };
  const treeTutorial = [
    {
      title: 'Science Products',
      videos: [
        {
          title: 'Science Products Overview',
          idVideo: '7VfilGzeCyg',
        },
      ],
    },
    {
      title: 'Sky Viewer',
      videos: [
        {
          title: 'Global Search',
          idVideo: 'sHdtM7cQ53w',
        },
        {
          title: 'Image Viewer',
          idVideo: 'iaArOxWVuD4',
        },
        {
          title: 'Overlay Catalog',
          idVideo: 'gLqVXY2oneM',
        },
        {
          title: 'Settings',
          idVideo: '-DEdCDg1GX4',
        },
      ],
    },
    {
      title: 'Target Viewer',
      videos: [
        {
          title: 'Add Target List DB',
          idVideo: 'mXXFRq68TmM',
        },
        {
          title: 'Add Target List Upload',
          idVideo: 'ppkG51Bl28A',
        },
        {
          title: 'Comments',
          idVideo: 'HW9OjA1FqUQ',
        },
        {
          title: 'Crop',
          idVideo: 'OgxXCoLRZuY',
        },
        {
          title: 'Download',
          idVideo: 'xNB28oZVmZw',
        },
        {
          title: 'Download Mosaic',
          idVideo: 'fFiG2cHYiKU',
        },
        {
          title: 'Explorer',
          idVideo: 'WUqyPTcVIsg',
        },
        {
          title: 'Explorer Coadd Object',
          idVideo: 'i20NHtnw7LQ',
        },
        {
          title: 'Filter',
          idVideo: '5iYBJ7ulkGs',
        },
        {
          title: 'Image Preference',
          idVideo: 'WlF4QEuOUag',
        },
        {
          title: 'Mosaic Generation',
          idVideo: 'NlMQIlwovqc',
        },
        {
          title: 'Mosaic Presentation',
          idVideo: 'iu8i0to9Jfk',
        },
        {
          title: 'Overlay Catalog',
          idVideo: 'TyIhYwwHEgo',
        },
        {
          title: 'Rating Reject',
          idVideo: '7eJxxKfjE8g',
        },
        {
          title: 'Settings Columns',
          idVideo: 'XXqgDyiOdTo',
        },
      ],
    },
    {
      title: 'Tile Inspection',
      videos: [
        {
          title: 'Comments',
          idVideo: 'bve7IElE89Y',
        },
        {
          title: 'Filter',
          idVideo: 'gDp4nWvJCVU',
        },
        {
          title: 'Position',
          idVideo: 'x44NVlY376c',
        },
        {
          title: 'Reporting',
          idVideo: 'vdKCp7vHc1A',
        },
        {
          title: 'Settings',
          idVideo: 'NEqNTs_GV-k',
        },
      ],
    },
    {
      title: 'User Query',
      videos: [
        {
          title: 'Create Execute Query',
          idVideo: 'TIl-KN4si8I',
        },
        {
          title: 'Download Query',
          idVideo: 'IQqEVtdxevY',
        },
        {
          title: 'View Query',
          idVideo: 'HnaxNB-O89o',
        },
      ],
    },
  ];

  const handleSelected = (video) => {
    setIdPlayer(video.idVideo);
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
            <TreeView
              defaultCollapseIcon={<ChevronRightIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              defaultExpanded={['1']}
            >
              {treeTutorial.map((Tutorial, index) => (
                <TreeItem
                  className={classes.treeView}
                  key={(index + 1).toString()}
                  nodeId={(index + 1).toString()}
                  label={Tutorial.title}
                >
                  {Tutorial.videos.map((video, indexVideos) => (
                    <TreeItem
                      className={classes.treeItem}
                      icon={<PlayCircleFilledIcon />}
                      key={(index + 1).toString() + (indexVideos + 1).toString()}
                      nodeId={(index + 1).toString() + (indexVideos + 1).toString()}
                      label={video.title}
                      onClick={() => { handleSelected(video); }}
                    />
                  ))}
                </TreeItem>
              ))}
            </TreeView>
          </Grid>
          <Grid item xs={8} sm={8}>
            <YouTube
              videoId={idPlayer}
              opts={opts}
            />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default Tutorials;
