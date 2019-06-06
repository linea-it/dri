import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Header from './components/Header';
import Footer from './components/Footer';
import { Grid } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { isEmpty } from 'lodash';
import VisiomaticPanel from './components/visiomatic/Visiomatic';
import DriApi from './api/Api';
import SelectReleases from './components/SelectReleases';
import DatasetList from './components/DatasetList';
const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    // padding: theme.spacing(2),
    textAlign: 'center',
    // color: theme.palette.text.secondary,
  },
  visiomatic: {
    width: 200,
    height: 200,
    backgroundColor: '#ff00ee',
  },
  tilelist: {
    minHeight: 200,
    textAlign: 'center',
  },
});

class Home extends Component {
  state = this.initialState;

  get initialState() {
    return {
      username: '',
      releases: [],
      currentRelease: '',
      datasets: [],
      currentDataset: {},
    };
  }

  async componentWillMount() {
    const user = await DriApi.loggedUser();
    const releases = await DriApi.allReleases();

    // const currentRelease = releases.length > 0 ? releases[0] : '';

    this.setState({
      username: user.username,
      releases: releases,
      // currentRelease: currentRelease.id,
    });
  }

  onChangeRelease = value => {
    this.setState(
      {
        currentRelease: value,
      },
      () => {
        this.loadData();
      }
    );
  };

  async loadData() {
    console.log('loadData()');
    const { currentRelease } = this.state;

    if (currentRelease > 0) {
      console.log('Get all Datasets');
      const datasets = await DriApi.datasetsByRelease(currentRelease);
      console.log('Datasets: ', datasets);
      this.setState({
        datasets: datasets.results,
      });
    }
  }

  onSelectDataset = dataset => {
    console.log('onSelectDataset: ', dataset);
    this.setState({
      currentDataset: dataset,
    });
  };

  render() {
    const { classes } = this.props;

    const {
      username,
      releases,
      currentRelease,
      datasets,
      currentDataset,
    } = this.state;

    return (
      <div>
        <Header title="Eyeballing" username={username} />
        <SelectReleases
          releases={releases}
          value={currentRelease}
          handleChange={this.onChangeRelease}
        />
        <Grid
          container
          direction="row"
          justify="flex-start"
          alignItems="stretch"
          spacing={16}
        >
          <Grid item xs={3}>
            <Paper className={classes.tilelist}>
              <DatasetList
                datasets={datasets}
                handleSelection={this.onSelectDataset}
                selected={currentDataset}
              />
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper className={classes.paper}>
              <VisiomaticPanel
                // image={'https://desportal.cosmology.illinois.edu/visiomatic?FIF=data/releases/desarchive/OPS/multiepoch/Y5A1/r4115/DES0223-0915/p02/qa/DES0223-0915_r4115p02.ptif'}
                image={currentDataset.image_src_ptif}
                className={classes.visiomatic}
                center={[currentDataset.tli_ra, currentDataset.tli_dec]}
                fov={2}
              />
            </Paper>
          </Grid>
          {/* <Grid item xs={3}>
            <Paper className={classes.paper}>xs=3</Paper>
          </Grid> */}
        </Grid>
        <Footer />
      </div>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);
