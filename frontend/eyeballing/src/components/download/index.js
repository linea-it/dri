import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Typography,
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
  files,
  error,
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

  const renderImages = () => {
    const images = 'images' in files ? files.images : null;
    const hasImages = images ? Object.keys(files.images).filter(key => files.images[key] !== '').length !== 0 : null;

    if (hasImages) {
      return (
        <>
          {/* <Typography variant="h6">Images</Typography> */}
          <List dense>
            {Object.keys(images).map(key => (
              <ListItem button onClick={() => handleItemClick(images[key])}>
                <ListItemIcon>
                  {isAuthenticating === images[key]
                    ? <CircularProgress size={20} />
                    : <DownloadIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={`${key}-Band Image`}
                />
              </ListItem>
            ))}
          </List>
        </>
      );
    }

    return null;
  };

  const renderCatalogs = () => {
    const catalogs = 'catalogs' in files ? files.catalogs : null;
    const hasCatalogs = catalogs ? Object.keys(files.catalogs).filter(key => files.catalogs[key] !== '').length !== 0 : null;

    if (hasCatalogs) {
      return (
        <>
          {/* <Typography variant="h6">Catalogs</Typography> */}
          <List dense>
            {Object.keys(catalogs).map(key => (
              <ListItem button onClick={() => handleItemClick(catalogs[key])}>
                <ListItemIcon>
                  {isAuthenticating === catalogs[key]
                    ? <CircularProgress size={20} />
                    : <DownloadIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={`${key}-Band Catalog`}
                />
              </ListItem>
            ))}
          </List>
        </>
      );
    }

    return null;
  };

  const renderOtherFiles = () => {
    const otherFiles = Object.keys(files).filter(key => key !== 'images' && key !== 'catalogs' && files[key] !== '');

    const keyMap = {
      detection: 'Detection Image',
      main: 'Main Catalog',
      magnitude: 'Magnitude Catalog',
      flux: 'Flux Catalog',
    };

    if (otherFiles.length > 0) {
      return (
        <List dense>
          {otherFiles.map(key => (
            <ListItem button onClick={() => handleItemClick(files[key])}>
              <ListItemIcon>
                {isAuthenticating === files[key]
                  ? <CircularProgress size={20} />
                  : <DownloadIcon />}
              </ListItemIcon>
              <ListItemText
                primary={keyMap[key]}
              />
            </ListItem>
          ))}
        </List>
      );
    }

    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
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
            {!error ? (
              <>
                <Grid item xs={12}>
                  {renderImages()}
                </Grid>
                <Grid item xs={12}>
                  {renderCatalogs()}
                </Grid>
                <Grid item xs={12}>
                  {renderOtherFiles()}
                </Grid>
              </>
            ) : (
              <Typography>Oops! No download was found for this tile.</Typography>
            )}
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
  files: PropTypes.objectOf(PropTypes.string),
  error: PropTypes.bool,
};

DownloadDialog.defaultProps = {
  error: false,
  files: null,
};

export default DownloadDialog;
