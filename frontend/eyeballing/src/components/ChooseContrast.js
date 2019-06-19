import React from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DialogContent from '@material-ui/core/DialogContent';

function ChooseContrast(props) {
  const { selectedValue, ...other } = props;

  function handleClose() {
    props.onClose(selectedValue);
  }

  function handleChange(event, newValue) {
    props.onClose(newValue);
  }

  return (
    <Dialog onClose={handleClose} {...other}>
      <DialogContent dividers>
        <DialogTitle>Choose Color Ranges</DialogTitle>
        <RadioGroup value={props.selectedValue} onChange={handleChange}>
          <FormControlLabel
            value={'highContrast'}
            control={<Radio />}
            label={'High Contrast'}
          />
          <FormControlLabel
            value={'defaultContrast'}
            control={<Radio />}
            label={'Default Contrast'}
          />
          <FormControlLabel
            value={'mediumContrast'}
            control={<Radio />}
            label={'Medium Contrast'}
          />
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}

ChooseContrast.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
  selectedValue: PropTypes.string,
};

export default ChooseContrast;
