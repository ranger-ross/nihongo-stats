import React from "react";
import {StylesProvider} from "@material-ui/styles";
import {ThemeProvider as MuiThemeProvider} from "@material-ui/core/styles";
import {CssBaseline, createTheme} from "@material-ui/core";
import {ThemeProvider} from '@mui/material/styles';

export const createAppTheme = ({darkMode}) =>
    createTheme({
        palette: {
            type: darkMode ? "dark" : "light",
            primary: {
                main: '#17b3ff'
            }
        },
    });

export function AppThemeProvider({children}) {
    const darkMode = true;
    const theme = React.useMemo(() => createAppTheme({darkMode}), [darkMode]);
    return (
        <StylesProvider injectFirst>
            <MuiThemeProvider theme={theme}>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    {children}
                </ThemeProvider>
            </MuiThemeProvider>
        </StylesProvider>
    )
}
