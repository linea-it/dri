import React from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DialogContent from '@material-ui/core/DialogContent';

function ChooseContrast(props) {
  const { selectedValue } = props;

  function handleClose() {
    props.handleClose(selectedValue);
  }

  function handleChange(event, newValue) {
    props.handleClose(newValue);
  }

  return (
    <Dialog onClose={handleClose} open={props.open}>
      <DialogContent dividers>
        <DialogTitle>Choose Color Ranges</DialogTitle>
        <RadioGroup value={props.selectedValue} onChange={handleChange}>
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
          <FormControlLabel
            value={'highContrast'}
            control={<Radio />}
            label={'High Contrast'}
          />
        </RadioGroup>
      </DialogContent>
    </Dialog>
  );
}

ChooseContrast.propTypes = {
  handleClose: PropTypes.func,
  open: PropTypes.bool,
  selectedValue: PropTypes.string,
};

export default ChooseContrast;
