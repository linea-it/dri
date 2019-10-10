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
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';

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
}));

function ChooseFilterCommentDialog({ selectedValue, handleClose, open }) {
  const classes = useStyles();

  function handleCloseDialog() {
    handleClose(selectedValue);
  }

  function handleChange(event, newValue) {
    handleClose(newValue);
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogContent dividers>
        <DialogTitle>Filter comments</DialogTitle>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleCloseDialog}>
          <CloseIcon className={classes.closeIcon} />
        </IconButton>
        <Divider />
        <RadioGroup value={selectedValue} onChange={handleChange}>
          <FormControlLabel
            value=""
            control={<Radio />}
            label="All"
          />
          <FormControlLabel
            value="0"
            control={<Radio />}
            label="Commented by user"
          />
          <FormControlLabel
            value="1"
            control={<Radio />}
            label="Commented by inspection"
          />
          <FormControlLabel
            value="2"
            control={<Radio />}
            label="Commented by image inspection"
          />
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}


ChooseFilterCommentDialog.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};

export default ChooseFilterCommentDialog;
