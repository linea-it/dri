import React from 'react';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Send from '@material-ui/icons/Send';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';
import MenuUpDelete from './MenuUpDelete';


const styles = theme => ({
  root: {
    minHeight: '30vh',
    maxHeight: '60vh',
  },
  cardComments: {
    marginBottom: theme.spacing(1),
  },
});

function CommentDialog(props) {
  const { classes } = props;
  const [values, setValues] = React.useState({
    id: null,
    inputValue: '',

  });


  function handleUpdate(comment) {
    setValues({ inputValue: comment.dts_comment, id: comment.id });

  }

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };

  const list = props.comments.map((comment, idx) => {
    return (
      <Card key={idx} className={classes.cardComments}>
        <CardContent>
          <Typography variant="subtitle2">{comment.owner}</Typography>
          <Typography variant="body2" color="textSecondary">
            {comment.dts_date}

          </Typography>
          <Typography variant="body2">{comment.dts_comment}</Typography>
          <MenuUpDelete handleDelete={props.handleDelete} handleClose={handleClose}
            handleUpdate={handleUpdate} comment={comment} />
        </CardContent>
      </Card>
    );
  });

  function handleSubmit() {
    if (values.inputValue && values.inputValue !== '') {
      props.handleSubmit(props.dataset, values);
      clear();
    };
  }


  function handleClose() {
    props.handleClose();
    clear();
  }

  function clear() {
    /*eslint no-useless-computed-key: "off"*/
    setValues({ inputValue: '', id: null });
  }

  function onKeyPress(e) {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }

  return (
    <Dialog
      open={props.open}
      onClose={handleClose}
      fullWidth
      maxWidth={'sm'}
      className={classes.root}
    >
      <DialogTitle>{props.dataset.tli_tilename}</DialogTitle>
      <DialogContent>{list}</DialogContent>
      <DialogActions>
        <TextField
          autoFocus
          margin="dense"
          label="Comment"
          multiline
          fullWidth
          value={values.inputValue}
          variant="outlined"
          onChange={handleChange('inputValue')}
          onKeyPress={onKeyPress}

        />
        <IconButton onClick={handleSubmit}>
          <Send />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}

CommentDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  dataset: PropTypes.object.isRequired,
  comments: PropTypes.array.isRequired,
};
export default withStyles(styles)(CommentDialog);
