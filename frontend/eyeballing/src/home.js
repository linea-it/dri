import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Header from './components/Header';
import Footer from './components/Footer';
import { Grid } from '@material-ui/core';
import VisiomaticPanel from './components/visiomatic/Visiomatic';
import DriApi from './api/Api';
import DatasetList from './components/DatasetList';
import Card from '@material-ui/core/Card';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import FilterListIcon from '@material-ui/icons/FilterList';
import Typography from '@material-ui/core/Typography';
import SearchField from './components/SearchField';
import SettingsIcon from '@material-ui/icons/Settings';
import { isEmpty, countBy } from 'lodash';
import CommentDialog from './components/comment/Dialog';
import ChooseContrast from './components/ChooseContrast';
import CardActions from '@material-ui/core/CardActions';
import Counter from './components/Counter';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  content: {
    padding: theme.spacing(2),
  },
  card: {
    height: 'auto',
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.grey[500],
  },
  visiomatic: {
    backgroundColor: theme.palette.grey[200],
  },
  tilelist: {
    height: '100%',
    textAlign: 'center',
  },
  tilesCount: {
    textAlign: 'left',
  },
  grow: {
    flexGrow: 1,
  },
});

class Home extends Component {
  state = this.initialState;

  driApi = new DriApi();

  get initialState() {
    return {
      username: '',
      releases: [],
      currentRelease: '',
      datasets: [],
      currentDataset: {},
      loading: false,
      showComment: false,
      comments: [],
      menuContrastOpen: false,
      contrast: 'defaultContrast',
      counts: {
        true: 0,
        false: 0,
        null: 0,
      },
    };
  }

  componentWillMount = async () => {
    const user = await this.driApi.loggedUser();
    const releases = await this.driApi.allReleases();

    const currentRelease = releases.length > 0 ? releases[0] : '';

    this.setState(
      {
        username: user.username,
        releases: releases,
        currentRelease: currentRelease.id,
      },
      this.onChangeRelease(currentRelease.id)
    );
  };

  onChangeRelease = value => {
    this.setState(
      {
        currentRelease: value,
        datasets: [],
        currentDataset: {},
      },
      () => {
        this.loadData(true);
      }
    );
  };

  async loadData(clear) {
    const { currentRelease } = this.state;

    if (currentRelease > 0) {
      if (clear) {
        this.setState({ loading: true });
        const datasets = await this.driApi.datasetsByRelease(currentRelease);
        const counts = countBy(datasets, el => {
          return el.isp_value;
        });
        this.setState({
          datasets: datasets,
          currentDataset: {},
          loading: false,
          counts: counts,
        });
      } else {
        const datasets = await this.driApi.datasetsByRelease(currentRelease);
        const counts = countBy(datasets, el => {
          return el.isp_value;
        });
        this.setState({
          datasets: datasets,
          counts: counts,
        });
      }
    }
  }

  onSelectDataset = dataset => {
    this.setState({
      currentDataset: dataset,
    });
  };

  qualifyDataset = (dataset, value) => {

    this.onSelectDataset(dataset);

    if (dataset.inspected !== null) {
      if (value !== null) {
        this.driApi.updateInspectValue(dataset.inspected, value).then(res => {
          this.loadData(false);
        });
      } else {
        this.driApi.deleteInspect(dataset.inspected).then(res => {
          this.loadData(false);
        });
      }
    } else {
      this.driApi.createinspect(dataset.id, value).then(res => {
        this.loadData(false);
      });
    }
  };

  handleComment = async dataset => {
    const comments = await this.driApi.commentsByDataset(dataset.id);

    this.setState({
      showComment: true,
      currentDataset: dataset,
      comments: comments,
    });
  };

  onComment = (dataset, comment) => {
    this.driApi.createDatasetComment(dataset.id, comment).then(() => {
      this.handleComment(dataset);

      this.loadData(false);
    });
  };

  handleMenuContrastOpen = () => {
    this.setState({ menuContrastOpen: true });
  };

  handleMenuContrastClose = contrast => {
    this.setState({ menuContrastOpen: false, contrast: contrast });
  };

  render() {
    const { classes } = this.props;

    const {
      username,
      releases,
      currentRelease,
      datasets,
      currentDataset,
      loading,
      showComment,
      comments,
      menuContrastOpen,
      contrast,
      counts,
    } = this.state;

    return (
      <div>
        <Header
          title="Tile Inspection"
          username={username}
          releases={releases}
          currentRelease={currentRelease}
          onChangeRelease={this.onChangeRelease}
        />
        <div className={classes.content}>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="stretch"
            spacing={2}
          >
            <Grid item xs={3}>
              <Card className={classes.tilelist}>
                <Toolbar>
                  <SearchField />
                  <div className={classes.grow}></div>
                  <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="Menu">
                    <FilterListIcon />
                  </IconButton>                  
                  <IconButton onClick={this.handleMenuContrastOpen}>
                    <SettingsIcon />
                  </IconButton>
                </Toolbar>
                {loading ? (
                  <div>Loading ...</div>
                ) : (
                  <div>
                    <DatasetList
                      datasets={datasets}
                      handleSelection={this.onSelectDataset}
                      handleQualify={this.qualifyDataset}
                      handleComment={this.handleComment}
                      selected={currentDataset}
                    />
                    <CardActions>
                      <Counter tiles={datasets.length} counts={counts} />
                    </CardActions>
                  </div>
                )}
              </Card>
            </Grid>
            <Grid item xs={9}>
              <Card className={classes.card}>
                <VisiomaticPanel
                  image={
                    !isEmpty(currentDataset)
                      ? currentDataset.image_src_ptif
                      : null
                  }
                  className={classes.visiomatic}
                  center={[currentDataset.tli_ra, currentDataset.tli_dec]}
                  fov={2}
                  contrast={contrast}
                />
              </Card>
            </Grid>
          </Grid>
          <CommentDialog
            open={showComment}
            dataset={currentDataset}
            comments={comments}
            handleClose={() => this.setState({ showComment: false })}
            handleSubmit={this.onComment}
          />
        </div>
        <Footer />
        <ChooseContrast
          selectedValue={contrast}
          open={menuContrastOpen}
          onClose={this.handleMenuContrastClose}
        />
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);
