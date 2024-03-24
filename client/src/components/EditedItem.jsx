import {TextField} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import React from "react";

export const EditedItem = ({taskID, editedText, setEditedText, saveEditing, cancelEditing}) => {
    return (
        <>
            <TextField
                autoFocus={true}
                variant="filled"
                fullWidth={true}
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        saveEditing(taskID);
                    } else if (e.key === 'Escape') {
                        cancelEditing();
                    }
                }}
            />
            <IconButton
                edge="end"
                size="small"
                color="secondary"
                onClick={() => cancelEditing()}
            >
                <CloseIcon/>
            </IconButton>
        </>
    )
}