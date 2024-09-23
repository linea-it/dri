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
              <List dense>
                {files.map((file) => (
                  <ListItem button onClick={() => handleItemClick(file.url)}>
                    <ListItemIcon>
                      {isAuthenticating === file.url
                        ? <CircularProgress size={20} />
                        : <DownloadIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={file.filename}
                    />
                  </ListItem>
                ))}
              </List>
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
  files: PropTypes.arrayOf(PropTypes.shape({
    filename: PropTypes.string,
    url: PropTypes.string,
  })),
  error: PropTypes.bool,
};

DownloadDialog.defaultProps = {
  error: false,
  files: null,
};

export default DownloadDialog;
