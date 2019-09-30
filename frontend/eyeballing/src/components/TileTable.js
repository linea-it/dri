import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  PagingState,
  CustomPaging,
  SortingState,
  SearchState,
} from '@devexpress/dx-react-grid';
import {
  Grid as TableGrid,
  Table,
  TableHeaderRow,
  Toolbar as TableToolbar,
  SearchPanel,
  TableColumnResizing,
  PagingPanel,
} from '@devexpress/dx-react-grid-material-ui';
import Toolbar from '@material-ui/core/Toolbar';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import GetApp from '@material-ui/icons/GetApp';
import CircularProgress from '@material-ui/core/CircularProgress';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import DriApi from '../api/Api';
import ChooserDownloadDialog from './ChooserDownloadDialog';

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
    marginBottom: theme.spacing(8),
  },
  title: {
    flexGrow: 1,
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    top: '50%',
    zIndex: 999,
    transform: 'translateY(-50%)',
  },
  progress: {
    margin: theme.spacing(2),
  },
  okButton: {
    color: theme.typography.successColor,
  },
}));

function CircularIndeterminate() {
  const classes = useStyles();

  return (
    <div className={classes.loading}>
      <CircularProgress className={classes.progress} color="secondary" />
    </div>
  );
}

function convertToCSV(objArray) {
  let str = '';

  for (let i = 0; i < objArray.length; i++) {
    let line = '';
    for (const index in objArray[i]) {
      if (line !== '') line += ',';
      line += objArray[i][index];
    }
    str += `${line}\r\n`;
  }

  return str;
}

function TileTable(props) {
  const api = new DriApi();
  const [data, setData] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [sorting, setSorting] = useState([{ columnName: 'dts_date', direction: 'desc' }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const { backLink, currentRelease } = props;
  const classes = useStyles();

  const columns = [
    { name: 'tilename', title: 'Tile', getCellValue: row => row.tilename },
    { name: 'isp_value', title: 'Status', getCellValue: row => row.isp_value },
    { name: 'owner', title: 'Owner', getCellValue: row => row.owner },
    { name: 'dts_date', title: 'Date', getCellValue: row => row.dts_date },
    { name: 'dts_comment', title: 'Comments', getCellValue: row => row.dts_comment },
  ];

  const defaultColumnWidths = [
    { columnName: 'tilename', width: 150 },
    { columnName: 'isp_value', width: 100 },
    { columnName: 'owner', width: 150 },
    { columnName: 'dts_date', width: 150 },
    { columnName: 'dts_comment', width: 'auto' },
  ];

  useEffect(() => {
    loadData();
  }, [sorting, currentPage, search, currentRelease]);

  function clearData() {
    setLoading(true);
    setData([]);
    setRows([]);
  }

  async function loadData() {
    const comments = await api.comments({
      release: currentRelease,
      sorting,
      search,
      offset: currentPage === 0 ? 0 : currentPage * 9,
      limit: 10,
    });

    if (comments.results && comments.results.length > 0) {
      setData(comments.results.map(comment => ({
        tilename: comment.tilename,
        isp_value: comment.isp_value,
        owner: comment.owner,
        dts_date: comment.dts_date,
        dts_comment: comment.dts_comment,
      })));
      setRows(comments.results.map(row => ({
        ...row,
        isp_value: renderInspectionValue(row),
      })));
      setTotalCount(comments.count);
      setLoading(false);
    } else {
      clearData();
    }
  }

  function downloadData(format) {
    if (data && data.length > 0) {
      let dataStr = '';
      if (format === 'json') {
        dataStr = `data:text/json;charset=utf-8, ${encodeURIComponent(JSON.stringify(data))}`;
      } else if (format === 'csv') {
        dataStr = `data:text/csv;charset=utf-8, ${convertToCSV(data)}`;
      }

      const downloadTag = document.getElementById('downloadDialogLink');
      downloadTag.setAttribute('href', dataStr);
      downloadTag.setAttribute('download', `report.${format}`);
      downloadTag.click();
    }
  }


  function handleDownloadDialog(checked) {
    if (typeof checked === 'string') {
      downloadData(checked);
    }
    setShowDownloadDialog(!showDownloadDialog);
  }

  function changeSorting(value) {
    clearData();
    console.log(value);
    setSorting(value);
  }

  function handleSearch(value) {
    clearData();
    setSearch(value);
  }

  function changeCurrentPage(value) {
    clearData();
    setCurrentPage(value);
  }

  function renderInspectionValue(rowData) {
    if (rowData.isp_value !== null) {
      return (
        rowData.isp_value === true ? (
          <ThumbUpIcon className={classes.okButton} />
        ) : (
          <ThumbDownIcon color="error" />
        )
      );
    }
    return '-';
  }

  return (
    <React.Fragment>
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="stretch"
      >
        <Card className={classes.card}>
          <Toolbar>
            <Typography variant="h6" className={classes.title}>
              Reporting
            </Typography>
            {backLink}
            <IconButton
              aria-label="Download report"
              aria-controls="download-appbar"
              aria-haspopup="true"
              color="inherit"
              onClick={handleDownloadDialog}
            >
              <GetApp />
            </IconButton>
          </Toolbar>

          <TableGrid rows={rows} columns={columns} className={classes.root}>
            <SearchState
              onValueChange={handleSearch}
            />
            <SortingState
              sorting={sorting}
              onSortingChange={changeSorting}
            />
            <PagingState
              currentPage={currentPage}
              onCurrentPageChange={changeCurrentPage}
              pageSize={10}
            />
            <CustomPaging totalCount={totalCount} />
            <Table />
            <TableColumnResizing defaultColumnWidths={defaultColumnWidths} />
            <TableHeaderRow showSortingControls />
            <TableToolbar />
            <SearchPanel />
            <PagingPanel />
            {loading ? <CircularIndeterminate /> : null}
          </TableGrid>
        </Card>
      </Grid>
      <ChooserDownloadDialog
        open={showDownloadDialog}
        handleClose={handleDownloadDialog}
      />
    </React.Fragment>
  );
}


export default TileTable;
