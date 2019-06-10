import React from 'react';
import PropTypes from 'prop-types';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { withStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import FormControl from '@material-ui/core/FormControl';
const styles = theme => ({
  cmbRelease: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  inputRoot: {
    color: theme.palette.primary.contrastText,
  },
  inputSelect: {
    padding: theme.spacing(1, 1, 1, 1),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 200,
      '&:focus': {
        width: 200,
      },
    },
  },
  inputIcon: {
    fill: theme.palette.primary.contrastText,
  },
});

function SelectReleases(props) {
  const { classes, releases, value } = props;

  function onChangeValue(e) {
    props.handleChange(e.target.value);
  }

  const listItens = releases.map((el, idx) => (
    <MenuItem key={idx} value={el.id}>
      {el.rls_display_name}
    </MenuItem>
  ));

  return (
    <div className={classes.cmbRelease}>
      <FormControl className={classes.formControl}>
        <Select
          value={value}
          onChange={onChangeValue}
          autoWidth
          inputProps={{
            name: 'releases',
          }}
          classes={{
            root: classes.inputRoot,
            select: classes.inputSelect,
            icon: classes.inputIcon,
          }}
          displayEmpty
        >
          <MenuItem value="" disabled>
            Choose a Release
          </MenuItem>
          {listItens}
        </Select>

      </FormControl>
    </div>
  );
}

SelectReleases.propTypes = {
  releases: PropTypes.array.isRequired,
  handleChange: PropTypes.func.isRequired,
  value: PropTypes.any,
  classes: PropTypes.object,
};

export default withStyles(styles, { withTheme: true })(SelectReleases);
