import React from "react";
import { StylesProvider } from "@material-ui/styles";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "styled-components";
import Wanikani from './wanikani/Wanikani'
import BunPro from './bunpro/BunPro'
import AppNav from './nav/AppNav'
import AppHeader from './header/AppHeader'
import { wanikaniAppName, bunproAppName } from './Constants.js'
import { createAppTheme } from './Theme'
import { useGlobalState } from "./GlobalState";

function App() {
  const darkMode = true;
  const theme = React.useMemo(() => createAppTheme({ darkMode }), [darkMode]);

  const { selectedApp, setSelectedApp } = useGlobalState();

  return (
    <StylesProvider injectFirst>
      <MuiThemeProvider {...{ theme }}>
        <ThemeProvider {...{ theme }}>
          <CssBaseline />
          <div style={{ width: '100vw', height: '100vh' }}>
            <AppHeader />
            <AppNav />

            {selectedApp == wanikaniAppName ? (
              <Wanikani />
            ) : selectedApp == bunproAppName ? (
              <BunPro />
            ) : null}

          </div>
        </ThemeProvider>
      </MuiThemeProvider>
    </StylesProvider>
  )
}

export default App
