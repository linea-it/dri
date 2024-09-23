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
}));

function ChooseFilterDialog(props) {
  const { selectedValue } = props;
  const classes = useStyles();

  function handleClose() {
    props.handleClose(selectedValue);
  }

  function handleChange(event, newValue) {
    props.handleClose(newValue);
  }

  return (
    <Dialog onClose={handleClose} open={props.open}>
      <DialogContent dividers>
        <DialogTitle>Filter the list of Tiles</DialogTitle>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
          <CloseIcon className={classes.closeIcon} />
        </IconButton>
        <Divider />
        <RadioGroup value={props.selectedValue} onChange={handleChange}>
          <FormControlLabel
            value=""
            control={<Radio />}
            label="All"
          />
          <FormControlLabel
            value="true"
            control={<Radio />}
            label="List good tiles"
          />
          <FormControlLabel
            value="false"
            control={<Radio />}
            label="List bad tiles"
          />
          <FormControlLabel
            value="null"
            control={<Radio />}
            label="List of tiles not inspected"
          />
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}

ChooseFilterDialog.propTypes = {
  handleClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};

export default ChooseFilterDialog;
