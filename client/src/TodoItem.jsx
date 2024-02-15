import {ListItemText} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from '@mui/icons-material/Done';
import RemoveDoneIcon from "@mui/icons-material/RemoveDone";
import React from "react";

export const TodoItem = ({id, entry, remove, startEditing, toggleDone, isDone}) => {

    return (
        <>
            <IconButton
                edge="start"
                size="small"
                color="primary"
                onClick={() => {
                    toggleDone(id);
                }}
            >
                {isDone ? <DoneIcon/> : <RemoveDoneIcon/>}
            </IconButton>

            <ListItemText
                primary={entry}
                primaryTypographyProps={{
                    component: 'div',
                    style: {
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                    },
                }}
            />

            <IconButton
                edge="end"
                size="small"
                color="primary"
                onClick={() => {
                    startEditing(id, entry);
                }}
            >
                <EditIcon/>
            </IconButton>

            <IconButton
                edge="end"
                size="small"
                color="delete"
                onClick={() => {
                    remove(id);
                }}
            >
                <DeleteIcon/>
            </IconButton>
        </>
    )
}