import React from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import InboxIcon from '@material-ui/icons/Inbox';
import DraftsIcon from '@material-ui/icons/Drafts';

function DatasetList(props) {
  const { datasets, selected } = props;

  console.log('Dataset List: ', datasets);

  const listItens = datasets.map((el, idx) => (
    <ListItem
      button
      key={idx}
      onClick={() => {
        props.handleSelection(el);
      }}
      divider
      selected={el.id === selected.id ? true : false}
    >
      <ListItemText primary={el.tli_tilename} />
    </ListItem>
  ));

  return <List>{listItens}</List>;
}

DatasetList.propTypes = {
  datasets: PropTypes.array.isRequired,
  selected: PropTypes.object,
  handleSelection: PropTypes.func.isRequired,
};

export default DatasetList;
