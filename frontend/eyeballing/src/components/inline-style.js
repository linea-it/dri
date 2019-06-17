import React from 'react';
import Proptypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = {
  textBig: {
    fontSize: '10vw',
  },
};

class Inline extends React.Component {
  static propTypes = {
    classes: Proptypes.object.isRequired,
  };

  render() {
    const { classes } = this.props;
    return <div className={classes.textBig}>TEST</div>;
  }
}

export default withStyles(styles)(Inline);
