/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  btnIco: {
    float: 'right',
  },
};

class CloseModal extends Component {
  render() {
    return (
      <IconButton
        style={styles.btnIco}
        edge="start"
        color="inherit"
        onClick={() => {
          this.props.callbackParent();
        }}
        aria-label="close"
      >
        <CloseIcon />
      </IconButton>
    );
  }
}
export default withStyles(styles)(CloseModal);
