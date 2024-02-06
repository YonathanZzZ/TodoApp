import React from "react";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";

const DisplayAlert = ({ message, onClose }) => {
    return (
        <Stack sx={{ width: "100%" }} spacing={2}>
            <Alert severity="error" onClose={onClose}>
                {message}
            </Alert>
        </Stack>
    );
};

export default DisplayAlert;