import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';


const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(3, 2),
    },
}));



export default function PaperSheet(props) {
    const classes = useStyles();

    return (

        <div>
            <Paper className={classes.root}>
                <Typography variant="subtitle1">
                    Tiles: {props.tiles}
                    {"  "}
                    Good: {props.counts.true ? props.counts.true : 0}
                    {"  "}
                    Bad: {props.counts.false ? props.counts.false : 0}
                    {"  "}
                    Not Inspected: {props.counts.null}
                </Typography>

            </Paper>

        </div>
    );
}


