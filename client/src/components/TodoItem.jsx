import {ListItemText, useTheme} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from '@mui/icons-material/Done';
import RemoveDoneIcon from "@mui/icons-material/RemoveDone";
import React from "react";

export const TodoItem = ({id, content, remove, startEditing, toggleDone, isDone}) => {
    const theme = useTheme();
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
                {isDone ? <RemoveDoneIcon/> : <DoneIcon/>}
            </IconButton>

            <ListItemText
                primary={content}
                primaryTypographyProps={{
                    component: 'div',
                    style: {
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                    },
                    color: theme.palette.text.main,
                }}
            />

            <IconButton
                edge="end"
                size="small"
                color="primary"
                onClick={() => {
                    startEditing(id, content);
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