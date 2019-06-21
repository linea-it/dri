import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
const useStyles = makeStyles(theme => ({
  root: {
    // padding: theme.spacing(3, 2),
    display: 'flex',
  },
  label: {
    marginRight: theme.spacing(1),
    fontWeight: 'bold',
  },
  value: {
    marginRight: theme.spacing(1),
  },
}));

export default function Counter(props) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Typography
        variant="subtitle1"
        gutterBottom
        className={classes.label}
        noWrap
      >
        Tiles:
      </Typography>
      <Typography
        variant="subtitle1"
        className={classes.value}
        gutterBottom
        noWrap
      >
        {props.tiles}
      </Typography>

      <Typography
        variant="subtitle1"
        gutterBottom
        className={classes.label}
        noWrap
      >
        Good:
      </Typography>
      <Typography
        variant="subtitle1"
        className={classes.value}
        gutterBottom
        noWrap
      >
        {props.counts.true ? props.counts.true : 0}
      </Typography>

      <Typography
        variant="subtitle1"
        gutterBottom
        className={classes.label}
        noWrap
      >
        Bad:
      </Typography>
      <Typography
        variant="subtitle1"
        className={classes.value}
        gutterBottom
        noWrap
      >
        {props.counts.false ? props.counts.false : 0}
      </Typography>

      <Typography
        variant="subtitle1"
        gutterBottom
        className={classes.label}
        noWrap
      >
        Not Inspected:
      </Typography>
      <Typography
        variant="subtitle1"
        className={classes.value}
        gutterBottom
        noWrap
      >
        {props.counts.null ? props.counts.null : 0}
      </Typography>
    </div>
  );
}
Counter.propTypes = {
  tiles: PropTypes.number.isRequired,
  counts: PropTypes.object.isRequired,
};
