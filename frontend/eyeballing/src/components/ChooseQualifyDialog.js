import React from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DialogContent from '@material-ui/core/DialogContent';

function ChooseQualifyDialog(props) {
    const { selectedValue, ...other } = props;

    function handleClose() {
        props.onClose(selectedValue);
    }

    //  function handleChange(event, newValue) {
    //      props.handleoption(newValue);
    //  }

    function handleChange(event) {
        props.handleoption(event.target.value);

    }


    return (
        <Dialog onClose={handleClose} {...other}>
            <DialogContent dividers>
                <DialogTitle>Choose the filter</DialogTitle>
                <RadioGroup value={props.selectedValue} onChange={handleChange}>
                    <FormControlLabel
                        value={'good'}
                        control={<Radio />}
                        label={'Good'}
                    />
                    <FormControlLabel
                        value={'bad'}
                        control={<Radio />}
                        label={'Bad'}
                    />
                    <FormControlLabel
                        value={'not'}
                        control={<Radio />}
                        label={'Not'}
                    />
                    <FormControlLabel
                        value={'default'}
                        control={<Radio />}
                        label={'Default'}
                    />
                </RadioGroup>
            </DialogContent>
        </Dialog>
    );
}


ChooseQualifyDialog.propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    selectedValue: PropTypes.string,
};

export default ChooseQualifyDialog;