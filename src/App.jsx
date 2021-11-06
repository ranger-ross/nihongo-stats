import React from "react";
import { StylesProvider } from "@material-ui/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import {ThemeProvider as MuiThemeProvider} from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "styled-components";
import AppNav from './nav/AppNav'
import AppHeader from './header/AppHeader'
import { Button, Typography } from "@material-ui/core";
import {createAppTheme} from './Theme'

function App() {
  var darkMode = true,
    theme = React.useMemo(() => createAppTheme({ darkMode }), [darkMode]);

  return (
    <StylesProvider injectFirst>
      <MuiThemeProvider {...{ theme }}>
        <ThemeProvider {...{ theme }}>
          <CssBaseline />
          <div style={{ width: '100vw', height: '100vh' }}>
            <AppHeader />
            <AppNav />


          </div>
        </ThemeProvider>
      </MuiThemeProvider>
    </StylesProvider>
  )
}

export default App
