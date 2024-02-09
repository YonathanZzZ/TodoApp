import {ListItemText} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from '@mui/icons-material/Done';
import React from "react";

export const TodoItem = ({index, entry, remove, startEditing, markAsDone}) => {

    return (
        <>
            <IconButton
                edge="start"
                size="small"
                color="primary"
                onClick={() => {
                    markAsDone(index);
                }}
            >
                <DoneIcon/>
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
                    startEditing(index, entry);
                }}
            >
                <EditIcon/>
            </IconButton>

            <IconButton
                edge="end"
                size="small"
                color="delete"
                onClick={() => {
                    remove(index);
                }}
            >
                <DeleteIcon/>
            </IconButton>
        </>
    )
}