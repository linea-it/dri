import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
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
  images,
  catalogs,
}) {
  const classes = useStyles();
  const [isAuthenticating, setIsAuthenticating] = useState('');

  const api = new DriApi();

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
      maxWidth="sm"
      className={classes.zIndex}
      fullWidth
    >
      <DialogTitle className={classes.dialogTitle}>{`Download - ${tilename}`}</DialogTitle>
      <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
        <CloseIcon className={classes.closeIcon} />
      </IconButton>
      <DialogContent className={classes.dialogContent}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Filename</TableCell>
                  <TableCell>Band</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Catalog</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(images).map(key => (
                  <TableRow key={key}>
                    <TableCell>
                      {`${tilename}_${key}.fits.gz`}
                    </TableCell>
                    <TableCell>
                      {key === 'y' ? key.toUpperCase() : key}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleItemClick(images[key])}>
                        {isAuthenticating === images[key]
                          ? <CircularProgress size={20} />
                          : <DownloadIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleItemClick(catalogs[key])}>
                        {isAuthenticating === catalogs[key]
                          ? <CircularProgress size={20} />
                          : <DownloadIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

DownloadDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  tilename: PropTypes.string.isRequired,
  images: PropTypes.shape({
    g: PropTypes.string,
    r: PropTypes.string,
    i: PropTypes.string,
    z: PropTypes.string,
    y: PropTypes.string,
  }).isRequired,
  catalogs: PropTypes.shape({
    g: PropTypes.string,
    r: PropTypes.string,
    i: PropTypes.string,
    z: PropTypes.string,
    y: PropTypes.string,
  }).isRequired,
};

export default DownloadDialog;
