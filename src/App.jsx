import React from "react";
import {BrowserRouter} from "react-router-dom";
import AppNav from './nav/AppNav'
import AppHeader from './header/AppHeader'
import {AppRoutes} from './Routes'
import {AppThemeProvider} from './Theme'
import {QueryClient, QueryClientProvider} from "react-query";

const queryClient = new QueryClient()

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AppThemeProvider>
                <BrowserRouter>
                    <div>
                        <AppHeader/>
                        <AppNav/>
                        <AppRoutes/>
                    </div>
                </BrowserRouter>
            </AppThemeProvider>
        </QueryClientProvider>
    );
}

export default App
