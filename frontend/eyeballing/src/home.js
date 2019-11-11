import React, {
  useState, useEffect, useRef, useCallback,
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
import { Virtuoso } from 'react-virtuoso';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import Comment from '@material-ui/icons/Comment';
import Divider from '@material-ui/core/Divider';
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
  const [loading, setLoading] = useState(true);
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
  const [inputSearchValue, setInputSearchValue] = useState('');
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [commentsWithFeature, setCommentsWithFeature] = useState([]);
  const datasetLoading = useRef(false);


  const api = new DriApi();
  const classes = useStyles();

  const onChangeRelease = (value) => {
    setLoading(true);
    setCurrentRelease(value);
    setDatasets([]);
    setCurrentDataset({});
  };

  useEffect(() => {
    api.loggedUser().then(res => setUsername(res.username));
    api.allReleases().then((res) => {
      setReleases(res);
      setCurrentRelease(res.length > 0 ? res[0].id : '');
    });
  }, []);

  const loadMoreDatasets = useCallback((e) => {
    const filters = [{
      property: 'inspected',
      value: filterInspect,
    }];

    if (datasetLoading.current) {
      return;
    }

    datasetLoading.current = true;
    api.datasetsByRelease({
      release: currentRelease, filters, search: inputSearchValue, offset: e || 0, limit: 20,
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
      });
  }, [datasets, currentRelease]);

  useEffect(() => {
    if (loading === true && currentRelease !== '') {
      api.datasetsByRelease({ release: currentRelease }).then((res) => {
        // Totais de Tiles boas, ruim e não inspecionadas
        const goodTiles = countBy(res, el => el.isp_value);
        goodTiles.tiles = res.length;
        setCounts(goodTiles);
        setLoading(false);
      });
      datasetLoading.current = false;
      loadMoreDatasets(0);
    }
  }, [currentRelease, filterInspect, loading]);

  useEffect(() => {
    if (loading === true && currentRelease !== '') loadMoreDatasets(0);
  }, [totalCount]);

  const loadData = () => {
    if (currentRelease !== '') {
      setDatasets([]);
      setCurrentDataset([]);
      setCounts({});
      setTotalCount(0);
      setLoading(true);
      datasetLoading.current = false;
    }
  };

  const onSelectDataset = dataset => setCurrentDataset(dataset);

  const handleClickSnackBar = () => setOpenSnackBar(!openSnackBar);

  const handleComment = (dataset) => {
    api.commentsByDataset(dataset.id).then((res) => {
      setCurrentDataset(dataset);
      setComments(res);
      setShowComment(true);
    });
  };

  useEffect(() => {
    api.getDatasetCommentsByType(currentDataset.id, 2).then(res => setCommentsWithFeature(res));
  }, [currentDataset]);

  const onComment = (dataset, comment) => {
    if (comment.id !== null) {
      // update
      api.updateComment(comment.id, comment.inputValue).then(() => {
        loadData();
        handleComment(dataset);
      });
    } else {
      const dts_type = comment.dts_type || '0';
      api.createDatasetComment(dataset.id, comment.inputValue, dts_type).then(() => {
        loadData();
        if (showComment === true) {
          handleComment(dataset);
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
          setLoading(true);
          handleClickSnackBar();
        });
      } else {
        api.deleteInspect(dataset.inspected).then(() => {
          setLoading(true);
          handleClickSnackBar();
        });
      }
    } else {
      api.createinspect(dataset.id, valueRef).then(() => {
        setLoading(true);
        handleClickSnackBar();
      });
    }
    loadData();
  };

  const handleMenuContrastOpen = () => setMenuContrastOpen(true);

  const handleMenuContrastClose = (value) => {
    setContrast(value);
    setMenuContrastOpen(false);
  };

  const handleMenuFilterOpen = () => setShowFilterDialog(true);

  const handleMenuFilterClose = (value) => {
    setFilterInspect(value);
    setShowFilterDialog(false);
    setTotalCount(0);
    loadData();
  };


  const handleInputSearch = (value) => {
    setInputSearchValue(value);
    setTotalCount(0);
    loadData();
  };

  const handleDelete = commentId => api.deleteComment(commentId).then(() => {
    handleComment(currentDataset);
    loadData();
  });


  const Row = (i) => {
    if (datasets.length > 0 && datasets[i]) {
      return (
        <ListItem
          className={classes.listItem}
          button
          key={datasets[i].id}
          onClick={() => {
            onSelectDataset(datasets[i]);
          }}
          divider
          selected={datasets[i].id === currentDataset.id}
        >
          <ListItemText
            primary={datasets[i].tli_tilename}
            secondary={(
              <MaterialLink
                className={datasets[i].comments > 0 ? classes.datasetWithComment : null}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleComment(datasets[i]);
                }}
              >
                {`${datasets[i].comments} comments`}
              </MaterialLink>
            )}
          />

          <ListItemSecondaryAction>
            <IconButton onClick={() => qualifyDataset(datasets[i], 'ok')}>
              {datasets[i].isp_value ? (
                <ThumbUpIcon className={classes.okButton} />
              ) : (
                <ThumbUpIcon />
              )}
            </IconButton>
            <IconButton onClick={() => qualifyDataset(datasets[i], 'notok')}>
              {datasets[i].isp_value === false ? (
                <ThumbDownIcon color="error" />
              ) : (
                <ThumbDownIcon />
              )}
            </IconButton>
            <IconButton onClick={() => handleComment(datasets[i])}>
              <Comment />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    }
  };

  const header = 64;
  const toolbar = 64;
  const footer = 64;
  const tilesCount = 40;
  const containerPadding = 32;

  return (
    <Router>
      <Header
        title="Tile Inspection"
        username={username}
        releases={releases}
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
                      <SearchField inputSearchValue={inputSearchValue} handleInputSearch={handleInputSearch} />
                      <div className={classes.grow} />
                      <Tooltip title="Filter">
                        <IconButton onClick={handleMenuFilterOpen} className={classes.menuButton} disabled={inputSearchValue !== ''}>
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
                          <IconButton onClick={() => {}} className={classes.menuButton}>
                            <TableChart className={classes.menuButtonIcon} />
                          </IconButton>
                        </Link>
                      </Tooltip>
                    </Toolbar>
                    <Virtuoso
                      style={{
                        height: (
                          window.innerHeight
                        - header
                        - toolbar
                        - footer
                        - tilesCount
                        - containerPadding
                        ),
                      }}
                      overscan={20}
                      initialItemCount={20}
                      totalCount={totalCount
                      }
                      item={Row}
                      endReached={e => loadMoreDatasets(e)}
                      // footer={() => (
                      //   <div style={{ padding: '2rem', textAlign: 'center' }}>
                      //     Loading...
                      //   </div>
                      // )}
                    />
                    <Divider />
                    {loading ? (
                      <LinearProgress color="secondary" className={classes.linearProgress} />
                    ) : (
                      <CardActions className={classes.cardActionCounter}>
                        <Counter counts={counts} />
                      </CardActions>
                    )}

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
                      currentDataset={currentDataset.id || null}
                      points={commentsWithFeature}
                    />
                  </Card>
                </Grid>
              </Grid>
              <CommentDialog
                open={showComment}
                dataset={currentDataset}
                comments={comments}
                handleClose={() => setShowComment(false)}
                handleSubmit={onComment}
                handleDelete={handleDelete}
              />
            </div>
            <SnackBar openSnackBar={openSnackBar} handleClickSnackBar={handleClickSnackBar} />
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
        handleClose={handleMenuContrastClose}
      />
      <ChooseFilterDialog
        open={showFilterDialog}
        selectedValue={filterInspect}
        handleClose={handleMenuFilterClose}
      />

    </Router>
  );
}

export default Home;
