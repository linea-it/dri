import React from 'react';
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

function ChooserDownloadDialog(props) {
  const { open } = props;
  const classes = useStyles();

  function handleClose() {
    props.handleClose(open);
  }

  function handleChange(event, checked) {
    props.handleClose(checked);
  }

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogContent dividers>
        <DialogTitle>Download Report</DialogTitle>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
          <CloseIcon className={classes.closeIcon} />
        </IconButton>
        <Divider />
        <RadioGroup value={props.selectedValue} onChange={handleChange}>
          <FormControlLabel
            value="csv"
            control={<Radio />}
            label="CSV"
          />
          <FormControlLabel
            value="json"
            control={<Radio />}
            label="JSON"
          />
        </RadioGroup>
        <a
          href="/"
          id="downloadDialogLink"
          style={{
            visibility: 0, height: 0, width: 0, fontSize: 0,
          }}
        >
          #
        </a>
      </DialogContent>
    </Dialog>
  );
}

export default ChooserDownloadDialog;
