import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import YouTubePlayer from 'react-player/lib/players/YouTube';

const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  closeIcon: {
    fontSize: '1rem',
  },
  playerWrapper: {
    position: 'relative',
  },
  blockWrapper: {
    marginBottom: theme.spacing(4),
  },
  contentWrapper: {
    marginTop: theme.spacing(2),
  },
}));

function TutorialDialog({
  open,
  setClose,
  data,
}) {
  const classes = useStyles();

  return (
    <Dialog onClose={setClose} open={open} fullWidth maxWidth="md" style={{ zIndex: 9999 }}>
      <DialogContent dividers>
        <DialogTitle>Tutorial</DialogTitle>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={setClose}>
          <CloseIcon className={classes.closeIcon} />
        </IconButton>
        <Divider />
        <Grid container spacing={3} className={classes.contentWrapper}>
          {data.length > 0 ? data.map(row => (
            <Fragment key={row.id}>
              <Grid item xs={12}>
                <div className={classes.blockWrapper}>
                  <Typography variant="h6" component="h2">
                    {row.ttr_title}
                  </Typography>
                  <Typography variant="subtitle1" component="p">
                    {row.ttr_description}
                  </Typography>
                  <div className={classes.playerWrapper}>
                    <YouTubePlayer
                      url={row.ttr_src}
                      width="auto"
                      controls
                    />
                  </div>
                </div>
                <Divider />
              </Grid>
            </Fragment>
          )) : (
            <Grid item xs={12}>
              <Typography variant="button">There is no tutorial registered for this application.</Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

TutorialDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  setClose: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default TutorialDialog;
