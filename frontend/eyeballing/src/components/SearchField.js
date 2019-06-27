import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, fade } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
const styles = theme => ({
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.black, 0.03),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.black, 0.07),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
  },
  inputRoot: {
    color: 'inherit',
  },
  searchIcon: {
    width: theme.spacing(5),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
});

function SearchField(props) {
  const { classes } = props;


  function handleInputSearch(event) {
    const value = event.target.value.toUpperCase();
    props.handleInputSearch(value);
  }


  return (
    <div className={classes.search}>
      <div className={classes.searchIcon}>
        <SearchIcon />
      </div>
      <InputBase onChange={handleInputSearch}
        value={props.inputSearchValue}
        placeholder="Search…"
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        inputProps={{ 'aria-label': 'Search' }}
      />
    </div>
  );
}

SearchField.propTypes = {
  inputSearchValue: PropTypes.string.isRequired,
  handleInputSearch: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired
};

export default withStyles(styles)(SearchField);
