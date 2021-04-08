import React from 'react';
import PropTypes from 'prop-types';
import MuiSnackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';

function Snackbar({ open, handleClose }) {
  return (
    <div>
      <MuiSnackbar
        open={open}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="warning">
          O captcha está ausente ou errado!
        </Alert>
      </MuiSnackbar>
    </div>
  );
}

Snackbar.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default Snackbar;
