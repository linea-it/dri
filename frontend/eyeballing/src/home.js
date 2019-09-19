import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { Grid } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import FilterListIcon from '@material-ui/icons/FilterList';
import SettingsIcon from '@material-ui/icons/Settings';
import { isEmpty, countBy, filter } from 'lodash';
import CardActions from '@material-ui/core/CardActions';
import LinearProgress from '@material-ui/core/LinearProgress';
import TableChart from '@material-ui/icons/TableChart';
import {
  BrowserRouter as Router, Route, Link, Redirect,
} from 'react-router-dom';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import TileTable from './components/TileTable';
import SnackBar from './components/SnackBar';
import ChooseFilterDialog from './components/ChooseFilterDialog';
import ChooseContrast from './components/ChooseContrast';
import Counter from './components/Counter';
import CommentDialog from './components/comment/Dialog';
import SearchField from './components/SearchField';
import DatasetList from './components/DatasetList';
import DriApi from './api/Api';
import VisiomaticPanel from './components/visiomatic/Visiomatic';
import Footer from './components/Footer';
import Header from './components/Header';

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
    backgroundColor: '#fff',
  },
  visiomatic: {
    backgroundColor: theme.palette.grey[200],
  },
  tilelist: {
    height: '100%',
    textAlign: 'center',
    minWidth: 300,
  },
  tilesCount: {
    textAlign: 'left',
  },
  grow: {
    flexGrow: 1,
  },
  loadingPlaceholder: {
    height: 4,
  },
  toolbar: {
    padding: `0 ${theme.spacing(1)}px`,
  },
  menuButton: {
    [theme.breakpoints.down('lg')]: {
      padding: 6,
    },
  },
  menuButtonIcon: {
    [theme.breakpoints.down('lg')]: {
      width: '.6em',
      height: '.6em',
    },
  },
  backLinkIcon: {
    borderRadius: 0,
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
      allDatasets: [],
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
      showFilterDialog: false,
      filterInspect: '',
      inputSearchValue: '',
      openSnackBar: false,
      forceLoad: false,
    };
  }

  componentWillMount = async () => {
    const user = await this.driApi.loggedUser();
    const releases = await this.driApi.allReleases();

    const currentRelease = releases.length > 0 ? releases[0] : '';

    this.setState(
      {
        username: user.username,
        releases,
        currentRelease: currentRelease.id,
        res: 'good',
      },
      this.onChangeRelease(currentRelease.id),
    );
  };

  onChangeRelease = (value) => {
    this.setState(
      {
        currentRelease: value,
        datasets: [],
        currentDataset: {},
      },
      () => {
        this.loadData(true);
      },
    );
  };

  async loadData(clear) {
    const { currentRelease } = this.state;

    if (currentRelease > 0) {
      this.setState({ loading: true });

      if (clear) {
        // const { datasets, counts, allDatasets } = await this.getDatasets()

        // this.setState({
        //   allDatasets: allDatasets,
        //   datasets: datasets,
        //   currentDataset: {},
        //   loading: false,
        //   counts: counts,
        // });
        this.setState({
          allDatasets: [],
          datasets: [],
          currentDataset: {},
          counts: {},
        }, () => {
          this.getDatasets();
        });
      } else {
        // const { datasets, counts, allDatasets } = await this.getDatasets()

        this.getDatasets();

        // this.setState({
        //   allDatasets: allDatasets,
        //   datasets: datasets,
        //   counts: counts,
        //   loading: false,
        // });
      }
    }
  }

  async getDatasets() {
    const { currentRelease } = this.state;
    let {
      allDatasets, datasets, filterInspect, inputSearchValue, forceLoad,
    } = this.state;

    if (inputSearchValue !== '' && forceLoad === false) {
      // Se tiver parametro de busca faz a busca localmente ao inves de fazer as requisicoes.
      datasets = this.localSearchByTilename(allDatasets, inputSearchValue);
      filterInspect = '';
    } else {
      const filters = [{
        property: 'inspected',
        value: filterInspect,
      },
      //  {
      //   property: 'search',
      //   value: inputSearchValue
      // }
      ];

      // Datasets Filtrados por release e ou inspected_value
      datasets = await this.driApi.datasetsByRelease(currentRelease, filters);
      // Todos os datasets do release
      allDatasets = await this.driApi.datasetsByRelease(currentRelease);
      inputSearchValue = '';
      forceLoad = false;
    }

    // Totais de Tiles boas, ruim e não inspecionadas
    const counts = countBy(allDatasets, el => el.isp_value);
    // Total de Tiles no Release.
    counts.tiles = allDatasets.length;

    this.setState({
      allDatasets,
      datasets,
      counts,
      loading: false,
      inputSearchValue,
      filterInspect,
      forceLoad,
    });

    // return { datasets, counts, allDatasets }
  }

  localSearchByTilename = (allDatasets, tilename) => {
    const results = filter(allDatasets, o => o.tli_tilename.includes(tilename));
    return results;
  }


  onSelectDataset = (dataset) => {
    this.setState({
      currentDataset: dataset,
    });
  };

  qualifyDataset = (dataset, value) => {
    this.onSelectDataset(dataset);

    if (dataset.inspected !== null) {
      if (value !== null) {
        this.driApi.updateInspectValue(dataset.inspected, value).then((res) => {
          this.setState({
            forceLoad: true,
          }, () => {
            this.loadData(false);
            this.handleClickSnackBar();
          });
        });
      } else {
        this.driApi.deleteInspect(dataset.inspected).then((res) => {
          this.setState({
            forceLoad: true,
          }, () => {
            this.loadData(false);
            this.handleClickSnackBar();
          });
        });
      }
    } else {
      this.driApi.createinspect(dataset.id, value).then((res) => {
        this.setState({
          forceLoad: true,
        }, () => {
          this.loadData(false);
          this.handleClickSnackBar();
        });
      });
    }
  };


  loadComments = async (dataset) => {
    const comments = await this.driApi.commentsByDataset(dataset.id);
    return comments;
  }

  handleComment = async (dataset) => {
    const comments = await this.loadComments(dataset);
    this.setState({
      showComment: true,
      currentDataset: dataset,
      comments,
    });
  };


  onComment = (dataset, comment) => {
    if (comment.id !== null) {
      // update
      this.driApi.updateComment(comment.id, comment.inputValue).then((res) => {
        this.handleComment(dataset);
        this.loadData(false);
      });
    } else {
      this.driApi.createDatasetComment(dataset.id, comment.inputValue).then(() => {
        this.loadData(false);
      });
    }
  };

  handleMenuContrastOpen = () => {
    this.setState({ menuContrastOpen: true });
  };

  handleMenuContrastClose = (contrast) => {
    this.setState({ menuContrastOpen: false, contrast });
  };

  handleMenuFilterOpen = () => {
    this.setState({ showFilterDialog: true });
  };

  handleMenuFilterClose = (value) => {
    this.setState({
      showFilterDialog: false,
      filterInspect: value,
    }, () => {
      this.loadData();
    });
  }


  handleInputSearch = (value) => {
    // const { allDatasets } = this.state;
    // this.setState({ inputSearchValue: value }, () => {
    //   this.loadData();
    // });
    this.setState({
      inputSearchValue: value,
      loading: true,
    }, () => {
      this.loadData();
    });
  };

  // onSearch = async () => {
  //   this.loadData()
  //   // const { datasets, counts, } = await this.getDatasets()

  //   // this.setState({datasets, counts, loading:false})

  // }


  handleDelete = (commentId) => {
    this.driApi.deleteComment(commentId).then(() => {
      this.setState({
        comments: [],
      }, () => {
        this.handleComment(this.state.currentDataset);
      });
    });

    this.loadData(false);
  }

  handleClickSnackBar = () => {
    this.setState({ openSnackBar: !this.state.openSnackBar });
  };

  handleSubmitOnComment = (dataset, comment) => {
    this.onComment(dataset, comment);
    this.handleComment(dataset);
  }

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
      showFilterDialog,
      filterInspect,
      valuequalify,
      inputSearchValue,
      openSnackBar,


    } = this.state;


    return (
      <Router>
        <Header
          title="Tile Inspection"
          username={username}
          releases={releases}
          currentRelease={currentRelease}
          onChangeRelease={this.onChangeRelease}
        />
        <Route exact path="/" render={() => <Redirect to="/eyeballing" />} />
        <Route
          exact
          path="/eyeballing/"
          render={() => (
            <React.Fragment>
              <div className={classes.content}>
                <Grid
                  container
                  direction="row"
                  justify="flex-start"
                  alignItems="stretch"
                  spacing={2}
                >
                  <Grid item xs={6} sm={4} md={3} lg={3}>
                    <Card className={classes.tilelist}>
                      <Toolbar className={classes.toolbar}>
                        <SearchField inputSearchValue={inputSearchValue} handleInputSearch={this.handleInputSearch} />
                        <div className={classes.grow} />
                        <Tooltip title="Filter">
                          <IconButton onClick={this.handleMenuFilterOpen} className={classes.menuButton} disabled={inputSearchValue !== ''}>
                            <FilterListIcon className={classes.menuButtonIcon} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Contrast">
                          <IconButton onClick={this.handleMenuContrastOpen} className={classes.menuButton}>
                            <SettingsIcon className={classes.menuButtonIcon} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reporting">
                          <Link to="/eyeballing/comments/">
                            <IconButton onClick={this.handleMenuTileTableOpen} className={classes.menuButton}>
                              <TableChart className={classes.menuButtonIcon} />
                            </IconButton>
                          </Link>
                        </Tooltip>
                      </Toolbar>
                      <div>
                        {loading ? (
                          <LinearProgress color="secondary" />
                        ) : (
                          <div className={classes.loadingPlaceholder} />
                        )}
                        <DatasetList
                          datasets={datasets}
                          handleSelection={this.onSelectDataset}
                          handleQualify={this.qualifyDataset}
                          handleComment={this.handleComment}
                          onComment={this.onComment}
                          selected={currentDataset}
                          valuequalify={valuequalify}
                          handleOpenSnackBar={this.handleOpenSnackBar}
                        />

                      </div>
                      <CardActions>
                        <Counter counts={counts} />
                      </CardActions>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={8} md={9} lg={9}>
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
                  handleSubmit={this.handleSubmitOnComment}
                  handleDelete={this.handleDelete}
                  handleUpdate={this.handleUpdate}
                  handleLoadComments={this.loadComments}
                  handleALert={this.handleAlert}
                />
              </div>
              <SnackBar openSnackBar={openSnackBar} handleClickSnackBar={this.handleClickSnackBar} />
            </React.Fragment>
          )}
        />
        <Route
          path="/eyeballing/comments/"
          render={() => (
            <TileTable
              currentRelease={currentRelease}
              className={classes.card}
              backLink={(
                <Link to="/eyeballing/" style={{ color: 'inherit', textDecoration: 'none' }}>
                  <IconButton
                    aria-label="Home"
                    aria-controls="home-appbar"
                    aria-haspopup="true"
                    color="inherit"
                    className={classes.backLinkIcon}
                  >
                    <ArrowBack />
                    <Typography variant="button" display="block">
                  Back
                    </Typography>
                  </IconButton>
                </Link>
            )}
            />
          )}
        />
        <Footer />
        <ChooseContrast
          selectedValue={contrast}
          open={menuContrastOpen}
          handleClose={this.handleMenuContrastClose}
        />
        <ChooseFilterDialog
          open={showFilterDialog}
          selectedValue={filterInspect}
          handleClose={this.handleMenuFilterClose}
        />

      </Router>
    );
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);
