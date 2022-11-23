import React, {useEffect} from "react";
import {BrowserRouter} from "react-router-dom";
import AppNav from './nav/AppNav'
import AppHeader from './header/AppHeader'
import {AppRoutes} from './Routes'
import {AppThemeProvider} from './Theme'
import {useTheme} from "@mui/material";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {persistWithIndexedDB} from "./util/ReactQueryAsyncStorage";
import {ErrorBoundary} from "react-error-boundary";
import {GenericErrorMessage} from "./shared/GenericErrorMessage";

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

export const QUERY_CLIENT_THROTTLE_TIME = 500;
export const QUERY_CLIENT_MAX_AGE = 1000 * 60 * 60 * 24 * 90; // 90 days;

export const queryClient = new QueryClient();
persistWithIndexedDB(queryClient, {
    IndexedDBKey: `REACT_QUERY_OFFLINE_CACHE`,
    throttleTime: QUERY_CLIENT_THROTTLE_TIME,
    maxAge: QUERY_CLIENT_MAX_AGE,
    buster: "v1"
})


function App() {
    return (
        <AppThemeProvider>
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>
                    <AppContainer>
                        <AppHeader/>
                        <AppNav/>
                        <ErrorBoundary FallbackComponent={GenericErrorMessage}>
                            <AppRoutes/>
                        </ErrorBoundary>
                    </AppContainer>
                </QueryClientProvider>
            </BrowserRouter>
        </AppThemeProvider>
    );
}

export default App
