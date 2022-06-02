import React, {useEffect} from "react";
import {BrowserRouter} from "react-router-dom";
import AppNav from './nav/AppNav'
import AppHeader from './header/AppHeader'
// @ts-ignore
import {AppRoutes} from './Routes'
import {AppThemeProvider} from './Theme'
import {useTheme} from "@mui/material";

function AppContainer({children}: React.PropsWithChildren<any>) {
    const theme = useTheme();

    useEffect(() => {
        // Properly set color-scheme.
        // If this is not set, the scrollbar on some devices will not match the rest of the app.
        const isDark = theme.palette.mode === 'dark';
        document.documentElement.style.setProperty('color-scheme', isDark ? 'dark' : 'light');
    }, [theme]);
    
    return (
        <div>
            {children}
        </div>
    );
}

function App() {
    return (
        <AppThemeProvider>
            <BrowserRouter>
                <AppContainer>
                    <AppHeader/>
                    <AppNav/>
                    <AppRoutes/>
                </AppContainer>
            </BrowserRouter>
        </AppThemeProvider>
    );
}

export default App
