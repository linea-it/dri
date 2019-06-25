import React from 'react';
import PropTypes from 'prop-types';
// import List from '@material-ui/core/List';
import { FixedSizeList } from 'react-window';
// import { VariableSizeList as List } from 'react-window';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import Link from '@material-ui/core/Link';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import Comment from '@material-ui/icons/Comment';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    listStyleType: 'none',
  },
  okButton: {
    color: theme.typography.successColor,
  },
  datasetWithComment: {
    color: theme.palette.secondary.main,
  },
});

function DatasetList(props) {
  const { classes, datasets, selected } = props;

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

  function handleComment(dataset) {
    props.handleComment(dataset);
   
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
          // secondary={`${el.comments} comments`}
          secondary={
            <Link
              className={el.comments > 0 ? classes.datasetWithComment : null}
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                handleComment(el);
              }}
            >
              {`${el.comments} comments`}
            </Link>
          }
        // secondaryTypographyProps={{
        //   className: el.comments > 0 ? classes.datasetWithComment : null,
        // }}
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
          <IconButton onClick={() => handleComment(el)}>
            <Comment />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    ));

    const Row = ({ index, style }) => {
      return <div style={style}> {listItens[index]}</div>;
    };

    const header = 64;
    const toolbar = 64;
    const footer = 64;
    const tilesCount = 40;
    const containerPadding = 32;
    return (
      <div>
        <FixedSizeList
          className={classes.root}
          height={
            window.innerHeight -
            header -
            toolbar -
            footer -
            tilesCount -
            containerPadding
          }
          // height={0}
          itemCount={listItens.length}
          itemSize={72}
        >
          {Row}
        </FixedSizeList>
        <Divider />
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
  handleComment: PropTypes.func.isRequired,
};

export default withStyles(styles)(DatasetList);
