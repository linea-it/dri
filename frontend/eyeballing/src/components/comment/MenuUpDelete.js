import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AlertDialog from './AlertDialog';



const ITEM_HEIGHT = 30;


export default function LongMenu(props) {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [showDialog, setShowDialog] = React.useState(false);
    const open = Boolean(anchorEl);

    const menuStyle = {
        display: 'flex',
        float: 'right'
    };

    function handleClick(event) {
        setAnchorEl(event.currentTarget);
    }

    function handleClose() {
        setAnchorEl(null);
    }


    function handleAlert() {
        setShowDialog(true);

    }

    function handleDelete() {
        props.handleDelete(props.comment.id);
        handleClose();
    }

    function handleUpdate() {
        props.handleUpdate(props.comment);
        handleClose();
    }

    function handleCancel() {
        setShowDialog(false);
        setAnchorEl(null);
    }

    return (
        <div>
            <IconButton
                aria-label="More"
                aria-controls="long-menu"
                aria-haspopup="true"
                onClick={handleClick}
                style={menuStyle}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
                id="long-menu"
                anchorEl={anchorEl}
                keepMounted
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: ITEM_HEIGHT * 4.5,
                        width: 200,

                    },
                }}

            >

                <MenuItem onClick={handleUpdate}> {"Edit"} </MenuItem>
                <MenuItem onClick={handleAlert}> {"Delete"} </MenuItem>

                <AlertDialog
                    open={showDialog}
                    title="Are you sure?"
                    content="This comment will be deleted."
                    handleCancel={() => handleCancel()}
                    handleOk={() => handleDelete()}
                />

            </Menu>
        </div>
    );
}