import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Card,
  CardHeader,
  CardContent,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Skeleton from '@material-ui/lab/Skeleton';
import useStyles from './styles';

function DownloadDialog({
  open,
  handleClose,
  tilename,
  center,
  corners,
  images,
  catalogs,
  currentRelease,
}) {
  const classes = useStyles();

  console.log('currentRelease', currentRelease);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{tilename || <Skeleton variant="text" />}</DialogTitle>
      <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
        <CloseIcon className={classes.closeIcon} />
      </IconButton>
      <DialogContent>
        <Card>
          <CardHeader title="Properties" />
          <CardContent>
            <Typography>{tilename || <Skeleton variant="text" />}</Typography>
            {/* <Typography>{center}</Typography>
            <Typography>{corners || <Skeleton variant="text" />}</Typography> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={currentRelease} />
          <CardContent>
            <Typography variant="h5">Images</Typography>
            <ul>
              {images && Object.keys(images).map(key => (
                <>
                  <li>{key}</li>
                  <li>{images[key]}</li>
                </>
              ))}
            </ul>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

DownloadDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  tilename: PropTypes.string,
  center: PropTypes.arrayOf(PropTypes.number),
  corners: PropTypes.shape({
    ra: PropTypes.arrayOf(PropTypes.number),
    dec: PropTypes.arrayOf(PropTypes.number),
  }),
  images: PropTypes.shape({
    g: PropTypes.string,
    r: PropTypes.string,
    i: PropTypes.string,
    z: PropTypes.string,
    y: PropTypes.string,
  }),
  catalogs: PropTypes.shape({
    g: PropTypes.string,
    r: PropTypes.string,
    i: PropTypes.string,
    z: PropTypes.string,
    y: PropTypes.string,
  }),
  currentRelease: PropTypes.string,
};

DownloadDialog.defaultProps = {
  tilename: null,
  center: [null, null],
  corners: PropTypes.shape({
    ra: null,
    dec: null,
  }),
  images: PropTypes.shape({
    g: null,
    r: null,
    i: null,
    z: null,
    y: null,
  }),
  catalogs: PropTypes.shape({
    g: null,
    r: null,
    i: null,
    z: null,
    y: null,
  }),
  currentRelease: null,
};


export default DownloadDialog;
