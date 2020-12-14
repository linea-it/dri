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
  badColor: {
    color: theme.palette.secondary.main,
  },
  goodColor: {
    color: theme.typography.successColor,
  },
}));

export default function Counter(props) {
  const classes = useStyles();
  const {
    total,
    good,
    bad,
  } = props.counts;

  const { hasInspection } = props;


  return (
    <div className={classes.root}>
      {hasInspection ? (
        <>
          <Typography
            variant="subtitle2"
            gutterBottom
            className={classes.label}
            noWrap
          >
            Examined:
          </Typography>
          <Typography
            variant="subtitle2"
            className={classes.value}
            gutterBottom
            noWrap
          >
            {good + bad}
          </Typography>
          <Typography
            variant="subtitle2"
            gutterBottom
            className={classes.label}
            noWrap
          >
            Good:
          </Typography>
          <Typography
            variant="subtitle2"
            className={`${classes.value}  ${classes.goodColor}`}
            gutterBottom
            noWrap
          >
            {`${((good * 100) / total).toFixed(2)}%`}
          </Typography>

          <Typography
            variant="subtitle2"
            gutterBottom
            className={classes.label}
            noWrap
          >
            Bad:
          </Typography>
          <Typography
            variant="subtitle2"
            className={`${classes.value}  ${classes.badColor}`}
            gutterBottom
            noWrap
          >
            {`${((bad * 100) / total).toFixed(2)}%`}
          </Typography>
        </>
      ) : (
        <>
          <Typography
            variant="subtitle2"
            gutterBottom
            className={classes.label}
            noWrap
          >
            Total:
          </Typography>
          <Typography
            variant="subtitle2"
            className={classes.value}
            gutterBottom
            noWrap
          >
            {total}
          </Typography>
        </>
      )}
    </div>
  );
}
Counter.propTypes = {
  counts: PropTypes.shape({
    total: PropTypes.number,
    good: PropTypes.number,
    bad: PropTypes.number,
  }).isRequired,
  hasInspection: PropTypes.bool.isRequired,
};
