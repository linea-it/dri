import React from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DialogContent from '@material-ui/core/DialogContent';

function ChooseQualifyDialog(props) {
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
                <DialogTitle>Choose the filter</DialogTitle>
                <RadioGroup value={props.selectedValue} onChange={handleChange}>
                    <FormControlLabel
                        value={'true'}
                        control={<Radio />}
                        label={'Good'}
                    />
                    <FormControlLabel
                        value={'false'}
                        control={<Radio />}
                        label={'Bad'}
                    />
                    <FormControlLabel
                        value={'null'}
                        control={<Radio />}
                        label={'Not'}
                    />
                    <FormControlLabel
                        value={''}
                        control={<Radio />}
                        label={'Default'}
                    />
                </RadioGroup>
            </DialogContent>
        </Dialog>
    );
}


ChooseQualifyDialog.propTypes = {
    handleClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    selectedValue: PropTypes.string.isRequired,
};

export default ChooseQualifyDialog;