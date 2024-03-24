import {createTheme} from "@mui/material/styles";

export const getDesignTokens = (mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
        ? {
            //palette values for light mode
                primary: {
                    main: "#26577C"
                },

                delete: {
                    main: "#b90000"
                },

                background: {
                    main: "#FFFFFF"
                },

                text: {
                    main: "#000000"
                }
            } : {
            //palette values for dark mode
                primary: {
                    main: "#1688d8",
                },

                delete: {
                    main: "#b90000"
                },

                background: {
                    main: "#2b2b2b"
                },

                text: {
                    main: "#FFFFFF"
                }
            })
    }
});

const theme = createTheme({
    palette: {
        primary: {
            main: "#26577C",

        },

        delete: {
            main: "#b90000"
        },

        text: {
            main: "#000000"
        }
    }
});

