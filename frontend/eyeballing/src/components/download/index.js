import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  FormGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from '@material-ui/core';
import {
  Close as CloseIcon,
  GetApp as DownloadIcon,
} from '@material-ui/icons';
import useStyles from './styles';
import DriApi from '../../api/Api';

function DownloadDialog({
  open,
  handleClose,
  tilename,
  center,
  corners,
  currentRelease,
  registeredReleases,
  releases,
}) {
  const classes = useStyles();
  const [selectedRelease, setSelectedRelease] = useState(currentRelease);
  const [isAuthenticating, setIsAuthenticating] = useState('');
  const [availableReleases, setAvailableReleases] = useState(null);
  const [tileData, setTileData] = useState(null);

  const api = new DriApi();

  useEffect(() => {
    if (releases) {
      setAvailableReleases(releases.map(row => row.release));
    }
  }, [releases]);

  useEffect(() => {
    const current = releases.filter(row => row.release === selectedRelease.toLowerCase())[0];
    const { bands } = current;

    setTileData(Object.keys(bands).map(band => ({
      band: band !== 'y' ? band.toLowerCase() : band,
      image: band.image,
      catalog: band.catalog,
    })));
  }, [selectedRelease]);

  const handleSelectedReleaseChange = (e) => {
    setSelectedRelease(e.target.value);
  };

  const handleItemClick = (url) => {
    setIsAuthenticating(url);
    api.getTokenizedDatasetUrl(url)
      .then((res) => {
        window.open(res, '_blank');
        setIsAuthenticating('');
      });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      className={classes.zIndex}
      fullWidth
    >
      <DialogTitle className={classes.dialogTitle}>Download</DialogTitle>
      <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
        <CloseIcon className={classes.closeIcon} />
      </IconButton>
      <DialogContent className={classes.dialogContent}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Properties" />
              <CardContent className={classes.cardContent}>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell style={{ width: 120 }} component="th" scope="row">
                        Name
                      </TableCell>
                      <TableCell>
                        {tilename}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Center
                      </TableCell>
                      <TableCell>
                        {center.join(', ')}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        RA Corners
                      </TableCell>
                      <TableCell>
                        {corners.ra.join(', ')}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        Dec Corners
                      </TableCell>
                      <TableCell>
                        {corners.dec.join(', ')}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
          {tileData && (
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Data" />
              <CardContent className={classes.cardContent}>
                <FormGroup row className={classes.checkboxGroup}>
                  {registeredReleases.map(release => (
                    <FormControlLabel
                      key={release}
                      control={(
                        <Radio
                          checked={selectedRelease === release}
                          value={release}
                          onChange={handleSelectedReleaseChange}
                          disabled={availableReleases
                          && availableReleases.indexOf(release.toLowerCase()) === -1}
                        />
                      )}
                      label={release}
                    />
                  ))}
                </FormGroup>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: 120 }} align="left">BAND</TableCell>
                      <TableCell style={{ width: 120 }}>IMAGE</TableCell>
                      <TableCell>CATALOG</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tileData.map(tile => (
                      <TableRow key={tile.band}>
                        <TableCell variant="head">
                          {tile.band}
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleItemClick(tile.image)}>
                            {isAuthenticating === tile.image
                              ? <CircularProgress size={20} />
                              : <DownloadIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleItemClick(tile.catalog)}>
                            {isAuthenticating === tile.catalog
                              ? <CircularProgress size={20} />
                              : <DownloadIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>

                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
          )}
        </Grid>

      </DialogContent>
    </Dialog>
  );
}

DownloadDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  tilename: PropTypes.string.isRequired,
  center: PropTypes.arrayOf(PropTypes.number).isRequired,
  corners: PropTypes.shape({
    ra: PropTypes.arrayOf(PropTypes.number),
    dec: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
  currentRelease: PropTypes.string.isRequired,
  releases: PropTypes.arrayOf(
    PropTypes.shape({
      release: PropTypes.string,
      bands: PropTypes.shape({
        G: PropTypes.shape({
          image: PropTypes.string,
          catalog: PropTypes.string,
        }),
        R: PropTypes.shape({
          image: PropTypes.string,
          catalog: PropTypes.string,
        }),
        I: PropTypes.shape({
          image: PropTypes.string,
          catalog: PropTypes.string,
        }),
        Z: PropTypes.shape({
          image: PropTypes.string,
          catalog: PropTypes.string,
        }),
        Y: PropTypes.shape({
          image: PropTypes.string,
          catalog: PropTypes.string,
        }),
      }),
      num_objects: PropTypes.number,
    }),
  ).isRequired,
  registeredReleases: PropTypes.arrayOf(PropTypes.string).isRequired,
};


export default DownloadDialog;
