import {ListItemText} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";

export const DoneItem = ({index, entry, remove}) => {

    return (
        <>
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