import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';


const useStyles = makeStyles(theme => ({
    close: {
        padding: theme.spacing(0.5),
    },

}));

export default function SimpleSnackbar(props) {
    const classes = useStyles();

    return (
        <div>
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={props.openSnackBar}
                autoHideDuration={1500}
                onClose={props.handleClickSnackBar}
                ContentProps={{
                    'aria-describedby': 'message-id',
                }}
                message={<span id="message-id" className={classes.messageInside}>Saved Succefully.</span>}
                action={[


                ]}
            />
        </div>
    );
}

