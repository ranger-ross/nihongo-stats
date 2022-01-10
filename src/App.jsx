import React from "react";
import {BrowserRouter} from "react-router-dom";
import AppNav from './nav/AppNav'
import AppHeader from './header/AppHeader'
import {AppRoutes} from './Routes'
import {AppThemeProvider} from './Theme'
import InMemoryCache from './util/InMemoryCache'

export const memoryCache = new InMemoryCache();

function App() {
    return (
        <AppThemeProvider>
            <BrowserRouter>
                <div>
                    <AppHeader/>
                    <AppNav/>
                    <AppRoutes/>
                </div>
            </BrowserRouter>
        </AppThemeProvider>
    );
}

export default App
