import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

export default function CommentDialog(props) {
  const list = props.comments.map((comment, idx) => {
    return (
      <Typography key={idx} variant="body2">
        {comment.dts_comment}
      </Typography>
    );
  });

  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      fullWidth
      maxWidth={'sm'}
    >
      <DialogTitle>{props.dataset.tli_tilename}</DialogTitle>
      <DialogContent>
        {list}
        <Divider />
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Email Address"
          type="email"
          fullWidth
        />
        {/* <TextField
          label="Comment"
          multiline
          rowsMax="4"
          value={values.multiline}
          onChange={handleChange('multiline')}
          className={classes.textField}
          margin="normal"
          helperText="hello"
          variant="outlined"
        />         */}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose} color="primary">
          Cancel
        </Button>
        {/* <Button onClick={handleOk} color="primary">
          Subscribe
        </Button> */}
      </DialogActions>
    </Dialog>
  );
}

CommentDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  dataset: PropTypes.object.isRequired,
  comments: PropTypes.array.isRequired,
};
