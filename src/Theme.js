import { createTheme } from "@material-ui/core";

export const createAppTheme = ({ darkMode }) =>
    createTheme({
        palette: {
            type: darkMode ? "dark" : "light",
            primary: {
                main: '#17b3ff'
            }
        },
    });