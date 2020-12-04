import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, fade } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import CircularProgress from '@material-ui/core/CircularProgress';


const useStyles = makeStyles(theme => ({
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.black, 0.03),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.black, 0.07),
    },
    marginRight: theme.spacing(1),
    marginLeft: 0,
    width: '100%',
    padding: `0 ${theme.spacing(1)}px`,
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(2)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
  searchIcon: {
    padding: 0,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearIcon: {
    padding: '0 4px',
    height: '100%',
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    right: 0,
    top: 0,
    zIndex: 1,
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
}));

function SearchField(props) {
  const classes = useStyles();
  const {
    searchRef, handleInputSearch, disabled,
  } = props;

  const handleClearSearch = () => {
    searchRef.current.value = '';
    handleInputSearch();
  };

  return (
    <div className={classes.search}>
      <div className={classes.searchIcon}>
        {disabled ? <CircularProgress color="inherit" size={24} /> : <SearchIcon />}
      </div>
      <InputBase
        inputRef={searchRef}
        onChange={handleInputSearch}
        disabled={disabled}
        placeholder="Search…"
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        inputProps={{ 'aria-label': 'Search' }}
      />
      {searchRef.current && searchRef.current.value.length > 0 && (

        <IconButton className={classes.clearIcon} onClick={handleClearSearch}>
          <CloseIcon size={16} />
        </IconButton>
      )}
    </div>
  );
}

SearchField.propTypes = {
  handleInputSearch: PropTypes.func.isRequired,
  searchRef: PropTypes.shape({
    current: PropTypes.oneOfType([
      PropTypes.instanceOf(Element),
      PropTypes.string,
    ]),
  }).isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default SearchField;
