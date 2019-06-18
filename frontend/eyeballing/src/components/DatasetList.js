import React from 'react';
import PropTypes from 'prop-types';
// import List from '@material-ui/core/List';
import { FixedSizeList } from 'react-window';
// import { VariableSizeList as List } from 'react-window';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Comments from './Comments';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    width: '100%',
    // height: 'calc(100vh - 64 - 64 - 28 - 32) !important',
    // maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    listStyleType: 'none',
  },
  okButton: {
    color: theme.typography.successColor,
  },
  commentLink: {
    color: 'blue',
    textDecoration: 'underline'
  }
});

function DatasetList(props) {
  const { classes, datasets, selected } = props;

  const [visible, setVisible] = React.useState(false);

  function changeQualify(dataset, label) {
    let value = null;
    if (label === 'ok') {
      if (dataset.isp_value === true) {
        // ja estava Ok volta para null
        value = null;
      } else {
        value = true;
      }
    } else {
      if (dataset.isp_value === false) {
        // ja estava Not Ok volta para null
        value = null;
      } else {
        value = false;
      }
    }

    props.handleQualify(dataset, value);
  }

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
          
        <ListItemText 
          primary={el.tli_tilename}
          secondary={
            <Link
              className={classes.commentLink}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setVisible(true);
              }}
              >
                0 comments
            </Link>
          }
          />

        <ListItemSecondaryAction>
          <IconButton onClick={() => changeQualify(el, 'ok')}>
            {el.isp_value ? (
              <ThumbUpIcon className={classes.okButton} />
            ) : (
              <ThumbUpIcon />
            )}
          </IconButton>
          <IconButton onClick={() => changeQualify(el, 'notok')}>
            {el.isp_value === false ? (
              <ThumbDownIcon color="error" />
            ) : (
              <ThumbDownIcon />
            )}
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    ));

    const Row = ({ index, style }) => {
      return <div style={style}> {listItens[index]}</div>;
    };

    const header = 64;
    const footer = 64;
    const tilesCount = 28;
    const containerPadding = 32;
    return (
      <div>
        <FixedSizeList
          className={classes.root}
          height={window.innerHeight - header - footer - tilesCount - containerPadding}
          // height={0}
          itemCount={listItens.length}
          itemSize={72}
        >
          {Row}
        </FixedSizeList>

        { visible ? <Comments active={visible} setActive={setVisible} /> : null }
      </div>
    );
  } else {
    return null;
  }
}

DatasetList.propTypes = {
  datasets: PropTypes.array.isRequired,
  selected: PropTypes.object,
  handleSelection: PropTypes.func.isRequired,
  handleQualify: PropTypes.func.isRequired,
};

export default withStyles(styles)(DatasetList);
