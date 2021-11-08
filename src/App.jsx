import React from "react";
import { BrowserRouter } from "react-router-dom";
import { StylesProvider } from "@material-ui/styles";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import { CssBaseline, Button } from "@material-ui/core";
import { ThemeProvider } from "styled-components";
import AppNav from './nav/AppNav'
import AppHeader from './header/AppHeader'
import { AppRoutes } from './Routes'
import { createAppTheme } from './Theme'
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles({
  container: {
    width: '100vw',
    height: '100vh'
  },
});


function App() {
  const darkMode = true;
  const theme = React.useMemo(() => createAppTheme({ darkMode }), [darkMode]);
  const classes = useStyles();

  return (
    <StylesProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <BrowserRouter>
            <div className={classes.container}>
              <AppHeader />
              <AppNav />
              <AppRoutes />
            </div>
          </BrowserRouter>
        </ThemeProvider>
      </MuiThemeProvider>
    </StylesProvider>
  )
}

export default App
