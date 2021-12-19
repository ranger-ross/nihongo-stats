import React from "react";
import {BrowserRouter} from "react-router-dom";
import {StylesProvider} from "@material-ui/styles";
import {ThemeProvider as MuiThemeProvider} from "@material-ui/core/styles";
import {CssBaseline} from "@material-ui/core";
import AppNav from './nav/AppNav'
import AppHeader from './header/AppHeader'
import {AppRoutes} from './Routes'
import {createAppTheme} from './Theme'
import {ThemeProvider} from '@mui/material/styles';


function App() {
    const darkMode = true;
    const theme = React.useMemo(() => createAppTheme({darkMode}), [darkMode]);

    return (
        <StylesProvider injectFirst>
            <MuiThemeProvider theme={theme}>
                <ThemeProvider theme={theme}>
                    <CssBaseline/>
                    <BrowserRouter>
                        <div>
                            <AppHeader/>
                            <AppNav/>
                            <AppRoutes/>
                        </div>
                    </BrowserRouter>
                </ThemeProvider>
            </MuiThemeProvider>
        </StylesProvider>
    )
}

export default App
