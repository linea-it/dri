import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import DriApi from '../../api/Api';

const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  closeIcon: {
    fontSize: '1rem',
  },
  dialogTitle: {
    padding: '0px 0 5px',
  },
  button: {
    marginTop: theme.spacing(1),
  },
  root: {
    zIndex: '9999 !important',
  },
}));

function ContextMenu({
  open,
  event,
  handleClose,
  currentDataset,
  latLngToHMSDMS,
  getDatasetCommentsByType,
  reloadData,
}) {
  const classes = useStyles();
  const api = new DriApi();
  const [features, setFeatures] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState('');
  const [otherReason, setOtherReason] = useState('');

  useEffect(() => {
    api.getFeatures().then(rows => setFeatures(rows));
  }, []);

  const handleChange = (e, newValue) => setSelectedFeature(newValue);

  const handleOtherReason = e => setOtherReason(e.target.value);

  const handleSave = () => {
    const currentFeatureName = features.filter(feature => feature.id === Number(selectedFeature))[0].ftr_name;
    if (currentFeatureName === 'Other') {
      api.createDatasetComment(currentDataset, `${otherReason} at ${latLngToHMSDMS(event.latlng)}`, 2, event.latlng.lng, event.latlng.lat)
        .then(() => {
          handleClose();
          getDatasetCommentsByType();
        })
        .catch(err => console.error(err));
    } else {
      api.createDatasetComment(currentDataset, `${currentFeatureName} at ${latLngToHMSDMS(event.latlng)}`, 2, event.latlng.lng, event.latlng.lat)
        .then(() => {
          handleClose();
          getDatasetCommentsByType();
        })
        .catch(err => console.error(err));
    }
    reloadData();
  };

  return (
    <Dialog onClose={handleClose} open={open} maxWidth="sm" fullWidth className={classes.root}>
      <DialogContent dividers>
        <DialogTitle className={classes.dialogTitle}>Features</DialogTitle>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleClose}>
          <CloseIcon className={classes.closeIcon} />
        </IconButton>
      </DialogContent>
      <DialogContent>
        <RadioGroup value={selectedFeature} onChange={handleChange}>
          {features.map(feature => (
            <FormControlLabel
              key={feature.id}
              value={String(feature.id)}
              control={<Radio />}
              label={feature.ftr_name}
            />
          ))}
          {selectedFeature === '10' ? (
            <TextField
              multiline
              rows="3"
              value={otherReason}
              onChange={handleOtherReason}
              variant="outlined"
            />
          ) : null}
        </RadioGroup>
      </DialogContent>
      <DialogContent>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          className={classes.button}
          onClick={handleSave}
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}

ContextMenu.defaultProps = {
  event: null,
  currentDataset: null,
};

ContextMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  event: PropTypes.objectOf(PropTypes.object),
  handleClose: PropTypes.func.isRequired,
  currentDataset: PropTypes.number,
  latLngToHMSDMS: PropTypes.func.isRequired,
  getDatasetCommentsByType: PropTypes.func.isRequired,
  reloadData: PropTypes.func.isRequired,
};

export default ContextMenu;
