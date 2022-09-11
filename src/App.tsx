import React, {useEffect} from "react";
import {BrowserRouter} from "react-router-dom";
import AppNav from './nav/AppNav'
import AppHeader from './header/AppHeader'
import {AppRoutes} from './Routes'
import {AppThemeProvider} from './Theme'
import {useTheme} from "@mui/material";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

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

const queryClient = new QueryClient()

function App() {
    return (
        <AppThemeProvider>
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <AppContainer>
                        <AppHeader/>
                        <AppNav/>
                        <AppRoutes/>
                    </AppContainer>
                </QueryClientProvider>
            </BrowserRouter>
        </AppThemeProvider>
    );
}

export default App
