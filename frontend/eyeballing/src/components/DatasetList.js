import React from 'react';
import PropTypes from 'prop-types';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Divider from '@material-ui/core/Divider';
import InboxIcon from '@material-ui/icons/Inbox';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import IconButton from '@material-ui/core/IconButton';

function DatasetList(props) {
  const { datasets, selected } = props;

  console.log('Dataset List: ', datasets);

  if (datasets && datasets.length > 0) {
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

        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="Delete">
            <ThumbUpIcon />
          </IconButton>
          <IconButton edge="end" aria-label="Delete">
            <ThumbDownIcon />
          </IconButton>          
        </ListItemSecondaryAction>
      </ListItem>
    ));

    return <List>{listItens}</List>;
  } else {
    return null;
  }
}

DatasetList.propTypes = {
  datasets: PropTypes.array.isRequired,
  selected: PropTypes.object,
  handleSelection: PropTypes.func.isRequired,
};

export default DatasetList;
