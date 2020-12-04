import React, {
  useState, useEffect, useRef,
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Link as MaterialLink } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import FilterListIcon from '@material-ui/icons/FilterList';
import SettingsIcon from '@material-ui/icons/Settings';
import { isEmpty, countBy } from 'lodash';
import CardActions from '@material-ui/core/CardActions';
import LinearProgress from '@material-ui/core/LinearProgress';
import TableChart from '@material-ui/icons/TableChart';
import {
  BrowserRouter as Router, Route, Link, Redirect,
} from 'react-router-dom';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import Comment from '@material-ui/icons/Comment';
import Divider from '@material-ui/core/Divider';
import InfiniteScroll from 'react-infinite-scroll-component';
import TileTable from './components/TileTable';
import SnackBar from './components/SnackBar';
import ChooseFilterDialog from './components/ChooseFilterDialog';
import ChooseContrast from './components/ChooseContrast';
import Counter from './components/Counter';
import CommentDialog from './components/comment/Dialog';
import SearchField from './components/SearchField';
import VisiomaticPanel from './components/visiomatic/Visiomatic';
import Footer from './components/Footer';
import Header from './components/Header';
import DriApi from './api/Api';


const useStyles = makeStyles(theme => ({
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
    position: 'relative',
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
  // rootDatasetList: {
  //   width: '100%',
  //   backgroundColor: theme.palette.background.paper,
  //   listStyleType: 'none',
  // },
  okButton: {
    color: theme.typography.successColor,
  },
  datasetWithComment: {
    color: theme.palette.secondary.main,
  },
  listItem: {
    listStyle: 'none !important',
  },
  linearProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cardActionCounter: {
    padding: '15px 8px 8px 8px',
  },
}));

function Home() {
  const [username, setUsername] = useState('');
  const [releases, setReleases] = useState([]);
  const [currentRelease, setCurrentRelease] = useState('');
  const [datasets, setDatasets] = useState([]);
  const [currentDataset, setCurrentDataset] = useState({});
  const [loadingAllTiles, setLoadingAllTiles] = useState(true);
  const [loadingList, setLoadingList] = useState(true);
  const [showComment, setShowComment] = useState(false);
  const [comments, setComments] = useState([]);
  const [menuContrastOpen, setMenuContrastOpen] = useState(false);
  const [contrast, setContrast] = useState('defaultContrast');
  const [counts, setCounts] = useState({
    true: 0,
    false: 0,
    null: 0,
  });
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [filterInspect, setFilterInspect] = useState('');
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [commentsWithFeature, setCommentsWithFeature] = useState([]);
  const datasetLoading = useRef(false);
  const [tutorial, setTutorial] = useState([]);
  const [hasInspection, setHasInspection] = useState(false);
  const [allTiles, setAllTiles] = useState([]);
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [visiomaticCenter, setVisiomaticCenter] = useState([]);
  const [fov, setFov] = useState(2);
  const searchRef = useRef('');


  const api = new DriApi();
  const classes = useStyles();

  useEffect(() => {
    api.getTileInspectionOption().then(res => setHasInspection(res.TILE_VIEWER_INSPECTION_ENABLED));
    api.loggedUser().then(res => setUsername(res.username));
    api.allReleases().then((res) => {
      setReleases(res);

      // Getting first item of all available releases:
      let release = res.length > 0 ? res[0].id : '';

      // Filter by releases with the default flag equal to true
      const releaseDefault = res.filter(row => row.rls_default);

      // If there's any release with the default flag on,
      // set the first item as the current release.
      if (releaseDefault.length > 0) {
        release = releaseDefault[0].id;
      }

      setCurrentRelease(release);
    });
    api.getTutorial().then(res => setTutorial(res));
  }, []);

  useEffect(() => {
    if (loadingAllTiles === true && currentRelease !== '') {
      api.datasetsByRelease({ release: currentRelease }).then((res) => {
        if (hasInspection) {
          // Totais de Tiles boas, ruim e não inspecionadas
          const goodTiles = countBy(res, el => el.isp_value);
          goodTiles.tiles = res.length;
          setCounts(goodTiles);
        } else {
          setCounts({ tiles: res.length });
        }
        if (allTiles.length === 0) {
          setAllTiles(res);
        }
        setLoadingAllTiles(false);
      });
    }
  }, [hasInspection, currentRelease, filterInspect, loadingAllTiles]);

  const loadMoreDatasets = () => {
    if (searchRef.current && searchRef.current.value.split(',').length > 1) {
      return;
    }

    const offset = datasets.length;


    const filters = [{
      property: 'inspected',
      value: filterInspect,
    }];

    datasetLoading.current = true;
    api.datasetsByRelease({
      release: currentRelease,
      filters,
      search: searchRef.current && searchRef.current.value,
      offset,
      limit: 20,
    })
      .then((data) => {
        const datasetConcat = datasets.concat(data.results);
        let datasetTotalCount = datasetConcat.length;
        if (datasetConcat.length < 20) {
          datasetTotalCount = data.count;
        }

        setTotalCount(datasetTotalCount);

        setDatasets(datasetConcat);
        if (data.count > 20) {
          datasetLoading.current = false;
        }
        setLoadingList(false);
      });
  };

  useEffect(() => {
    if (loadingList && currentRelease !== '') {
      loadMoreDatasets();
    }
  }, [currentRelease, loadingList]);

  const reloadList = () => {
    setDatasets([]);
    setTotalCount(0);
    datasetLoading.current = false;
    setLoadingList(true);
  };

  const reloadAllTiles = () => {
    setLoadingAllTiles(true);
    setCounts({});
  };

  const onSelectDataset = dataset => setCurrentDataset(dataset);

  useEffect(() => {
    if (Object.keys(currentDataset).length > 0) {
      const searchSplit = searchRef.current.value.split(',');

      if (searchSplit.length === 2) {
        setVisiomaticCenter([
          searchSplit[0],
          searchSplit[1],
        ]);
        setFov(0.5);
      } else {
        setVisiomaticCenter([
          currentDataset.tli_ra,
          currentDataset.tli_dec,
        ]);
        setFov(2);
      }
    }
  }, [currentDataset]);

  const handleClickSnackBar = () => setOpenSnackBar(!openSnackBar);

  const handleComment = (dataset) => {
    api.commentsByDataset(dataset.id).then((res) => {
      // In case of the comment button being fired,
      // verify if it isn't the button of the current dataset.
      if (dataset.id !== currentDataset.id) {
        setCurrentDataset(dataset);
      }
      setComments(res);
      setShowComment(true);
    });
  };

  const getDatasetCommentsByType = () => {
    setCommentsWithFeature([]);
    return api.getDatasetCommentsByType(currentDataset.id, 2).then(res => setCommentsWithFeature(res));
  };

  useEffect(() => {
    if (hasInspection) {
      getDatasetCommentsByType();
    }
  }, [currentDataset, hasInspection]);

  const onComment = (dataset, comment) => {
    if (comment.id !== null) {
      // update
      api.updateComment(comment.id, comment.inputValue, null, null).then(() => {
        handleComment(dataset);
        reloadList();
      });
    } else {
      const dts_type = comment.dts_type || '0';
      api.createDatasetComment(dataset.id, comment.inputValue, dts_type, null, null).then(() => {
        if (showComment === true) {
          handleComment(dataset);
          reloadList();
        }
      });
    }
  };

  const qualifyDataset = (dataset, value) => {
    let valueRef = null;

    if (value === 'ok') {
      if (dataset.isp_value === true) {
        // ja estava Ok volta para null
        valueRef = null;
        onComment(dataset, {
          id: null,
          inputValue: 'Tile dismarked.',
          dts_type: '1',
        });
      } else {
        valueRef = true;
        onComment(dataset, {
          id: null,
          inputValue: 'Marked tile as good.',
          dts_type: '1',
        });
      }
    } else if (dataset.isp_value === false) {
      // ja estava Not Ok volta para null
      valueRef = null;
      onComment(dataset, {
        id: null,
        inputValue: 'Tile dismarked.',
        dts_type: '1',
      });
    } else {
      valueRef = false;
      onComment(dataset, {
        id: null,
        inputValue: 'Tile marked as bad.',
        dts_type: '1',
      });
    }

    onSelectDataset(dataset);

    if (dataset.inspected !== null) {
      if (valueRef !== null) {
        api.updateInspectValue(dataset.inspected, valueRef).then(() => {
          handleClickSnackBar();
        });
      } else {
        api.deleteInspect(dataset.inspected).then(() => {
          handleClickSnackBar();
        });
      }
    } else {
      api.createinspect(dataset.id, valueRef).then(() => {
        handleClickSnackBar();
      });
    }
    reloadList();
    reloadAllTiles();
  };

  const handleMenuContrastOpen = () => setMenuContrastOpen(true);

  const handleMenuContrastClose = (value) => {
    setContrast(value);
    setMenuContrastOpen(false);
  };

  const handleMenuFilterOpen = () => setShowFilterDialog(true);

  const handleMenuFilterClose = (value) => {
    if (value !== filterInspect) {
      setFilterInspect(value);
      setShowFilterDialog(false);
      setTotalCount(0);
      reloadList();
    }
  };

  const filterByRaDec = (ra, dec) => {
    /**
     * e necessario converter os cantos da tile em ra para -180 e 180
     * para que as tiles que ficam perto do 0 nao deem erro.
     *
     */

    const result = [];

    allTiles.forEach((tile) => {
      if (ra > 180) {
        ra -= 360;
      }

      let urall = tile.tli_urall;
      let uraur = tile.tli_uraur;

      if (urall > 180) {
        urall -= 360;
      }

      if (uraur > 180) {
        uraur -= 360;
      }

      // tli_urall < ra
      // AND tli_udecll < dec
      // AND tli_uraur > ra
      // AND tli_udecur > dec
      if (urall < ra && tile.tli_udecll < dec && uraur > ra && tile.tli_udecur > dec) {
        result.push(tile);
        return false;
      }
    });

    return result;
  };

  const handleInputSearch = () => {
    const searchSplit = searchRef.current.value.split(',');

    if (searchSplit.length === 2) {
      const datasetByPosition = filterByRaDec(
        parseFloat(searchSplit[0]),
        parseFloat(searchSplit[1]),
      );

      if (datasetByPosition.length > 0) {
        datasetLoading.current = true;
        setDatasets(datasetByPosition);
        setTotalCount(datasetByPosition.length);
        datasetLoading.current = false;
      }
    } else {
      reloadList();
    }
  };

  const handleDelete = commentId => api.deleteComment(commentId).then(() => {
    handleComment(currentDataset);
    reloadList();
  });

  const onChangeRelease = (value) => {
    setLoadingAllTiles(true);
    setCurrentRelease(value);
    reloadList();
    reloadAllTiles();
  };

  useEffect(() => {
    if (allTiles.length > 0) {
      setSearchEnabled(true);
    } else {
      setSearchEnabled(false);
    }
  }, [allTiles]);

  const Rows = () => datasets.map(dataset => (
    <ListItem
      className={classes.listItem}
      button
      key={dataset.id}
      onClick={() => {
        onSelectDataset(dataset);
      }}
      divider
      selected={dataset.id === currentDataset.id}
    >
      <ListItemText
        primary={dataset.tli_tilename}
        secondary={hasInspection ? (
          <MaterialLink
            className={dataset.comments > 0 ? classes.datasetWithComment : null}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleComment(dataset);
            }}
          >
            {`${dataset.comments} comments`}
          </MaterialLink>
        ) : null}
      />
      {hasInspection ? (
        <ListItemSecondaryAction>
          <IconButton onClick={() => qualifyDataset(dataset, 'ok')}>
            {dataset.isp_value ? (
              <ThumbUpIcon className={classes.okButton} />
            ) : (
              <ThumbUpIcon />
            )}
          </IconButton>
          <IconButton onClick={() => qualifyDataset(dataset, 'notok')}>
            {dataset.isp_value === false ? (
              <ThumbDownIcon color="error" />
            ) : (
              <ThumbDownIcon />
            )}
          </IconButton>
          <IconButton onClick={() => handleComment(dataset)}>
            <Comment />
          </IconButton>
        </ListItemSecondaryAction>
      ) : null}
    </ListItem>
  ));

  const header = 64;
  const toolbar = 64;
  const footer = 64;
  const tilesCount = 40;
  const containerPadding = 32;

  return (
    <Router>
      <Header
        title="Tile Viewer"
        username={username}
        releases={releases}
        tutorial={tutorial}
        currentRelease={currentRelease}
        onChangeRelease={onChangeRelease}
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
                      <SearchField
                        searchRef={searchRef}
                        handleInputSearch={handleInputSearch}
                        disabled={!searchEnabled}
                      />
                      <div className={classes.grow} />
                      {hasInspection ? (
                        <>
                          <Tooltip title="Filter">
                            <IconButton onClick={handleMenuFilterOpen} className={classes.menuButton} disabled={searchRef.current && searchRef.current.value !== ''}>
                              <FilterListIcon className={classes.menuButtonIcon} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Contrast">
                            <IconButton onClick={handleMenuContrastOpen} className={classes.menuButton}>
                              <SettingsIcon className={classes.menuButtonIcon} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reporting">
                            <Link to="/eyeballing/comments/">
                              <IconButton className={classes.menuButton}>
                                <TableChart className={classes.menuButtonIcon} />
                              </IconButton>
                            </Link>
                          </Tooltip>
                        </>
                      ) : null}
                    </Toolbar>
                    <div
                      id="datasetList"
                      style={{
                        overflowY: 'auto',
                        height: (
                          window.innerHeight
                          - header
                          - toolbar
                          - footer
                          - tilesCount
                          - containerPadding
                        ),
                      }}
                    >

                      <InfiniteScroll
                        id="datasetList"
                        dataLength={totalCount}
                        next={loadMoreDatasets}
                        hasMore={datasets.length < 10169}
                        loader={loadingList ? <h4>Loading...</h4> : null}
                        scrollableTarget="datasetList"
                      >
                        {Rows()}
                      </InfiniteScroll>
                    </div>
                    <Divider />
                    <>
                      {loadingAllTiles ? (
                        <LinearProgress color="secondary" className={classes.linearProgress} />
                      ) : (
                        <CardActions className={classes.cardActionCounter}>
                          <Counter hasInspection={hasInspection} counts={counts} />
                        </CardActions>
                      )}
                    </>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={8} md={9} lg={9}>
                  <Card className={classes.card}>
                    {currentRelease !== '' ? (
                      <VisiomaticPanel
                        image={
                          !isEmpty(currentDataset)
                            ? currentDataset.image_src_ptif
                            : null
                        }
                        className={classes.visiomatic}
                        center={visiomaticCenter}
                        fov={fov}
                        contrast={contrast}
                        currentDataset={currentDataset.id || null}
                        points={commentsWithFeature}
                        getDatasetCommentsByType={getDatasetCommentsByType}
                        reloadData={reloadList}
                        hasInspection={hasInspection}
                      />
                    ) : null}
                  </Card>
                </Grid>
              </Grid>
              {hasInspection ? (
                <CommentDialog
                  open={showComment}
                  dataset={currentDataset}
                  comments={comments}
                  handleClose={() => setShowComment(false)}
                  handleSubmit={onComment}
                  handleDelete={handleDelete}
                />
              ) : null}
            </div>
            {hasInspection ? <SnackBar openSnackBar={openSnackBar} handleClickSnackBar={handleClickSnackBar} /> : null}
          </React.Fragment>
        )}
      />
      {hasInspection ? (
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
      ) : null}
      <Footer />

      {hasInspection ? (
        <>
          <ChooseContrast
            selectedValue={contrast}
            open={menuContrastOpen}
            handleClose={handleMenuContrastClose}
          />
          <ChooseFilterDialog
            open={showFilterDialog}
            selectedValue={filterInspect}
            handleClose={handleMenuFilterClose}
          />
        </>
      ) : null}

    </Router>
  );
}

export default Home;
