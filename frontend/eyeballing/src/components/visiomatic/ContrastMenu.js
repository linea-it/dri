import React from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  closeIcon: {
    fontSize: '1rem',
  },
  dialogTitle: {
    padding: '0px 0 5px',
  },
  root: {
    zIndex: '9999 !important',
  },
}));

function ContrastMenu({
  open,
  currentContrast,
  handleChange,
  handleClose,
}) {
  const classes = useStyles();

  return (
    <Dialog onClose={handleClose} open={open} maxWidth="sm" fullWidth className={classes.root}>
      <DialogContent dividers>
        <DialogTitle className={classes.dialogTitle}>Choose Color Ranges</DialogTitle>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
          <CloseIcon className={classes.closeIcon} />
        </IconButton>
      </DialogContent>
      <DialogContent>
        <RadioGroup value={currentContrast} onChange={handleChange}>
          <FormControlLabel
            value="defaultContrast"
            control={<Radio />}
            label="Default Contrast"
          />
          <FormControlLabel
            value="mediumContrast"
            control={<Radio />}
            label="Medium Contrast"
          />
          <FormControlLabel
            value="highContrast"
            control={<Radio />}
            label="High Contrast"
          />
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}

ContrastMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  currentContrast: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default ContrastMenu;
