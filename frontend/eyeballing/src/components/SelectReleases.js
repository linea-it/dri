import React from 'react';
import PropTypes from 'prop-types';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

function SelectReleases(props) {
  const { releases, value } = props;

  function onChangeValue(e) {
    props.handleChange(e.target.value);
  }

  const listItens = releases.map((el, idx) => (
    <MenuItem key={idx} value={el.id}>
      {el.rls_display_name}
    </MenuItem>
  ));

  return (
    <Select
      value={value}
      onChange={onChangeValue}
      autoWidth
      inputProps={{
        name: 'releases',
      }}
    >
      {listItens}
    </Select>
  );
}

SelectReleases.propTypes = {
  releases: PropTypes.array.isRequired,
  handleChange: PropTypes.func.isRequired,
  value: PropTypes.any,
};

export default SelectReleases;
