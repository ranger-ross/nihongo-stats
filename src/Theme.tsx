import React from "react";
import {createTheme, ThemeProvider} from '@mui/material/styles';
import {CssBaseline} from "@mui/material";

export const createAppTheme = ({darkMode}: { darkMode: boolean }) => {
    return createTheme({
        palette: {
            mode: darkMode ? "dark" : "light",
            primary: {
                main: '#17b3ff'
            }
        },
    })
};

export function AppThemeProvider({children}: React.PropsWithChildren<unknown>) {
    const darkMode = true;
    const theme = React.useMemo(() => createAppTheme({darkMode}), [darkMode]);
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            {children}
        </ThemeProvider>
    )
}
