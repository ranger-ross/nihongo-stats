import { Button, createTheme } from "@material-ui/core";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core/styles";
import { wanikaniColors } from "../../Constants";

const createPinkButtonTheme = ({ darkMode }) =>
    createTheme({
        palette: {
            type: darkMode ? "dark" : "light",
            primary: {
                main: wanikaniColors.pink
            }
        },
    });

export function WanikaniPinkButton(props) {
    const theme = createPinkButtonTheme(true);
    return (
        <MuiThemeProvider theme={theme}>
            <Button {...props} color={'primary'}>
                {props.children}
            </Button>
        </MuiThemeProvider>
    );
}

const createBlueButtonTheme = ({ darkMode }) =>
    createTheme({
        palette: {
            type: darkMode ? "dark" : "light",
            primary: {
                main: wanikaniColors.blue
            }
        }
    });

export function WanikaniBlueButton(props) {
    const theme = createBlueButtonTheme(true);
    return (
        <MuiThemeProvider theme={theme}>
            <Button {...props} color={'primary'} style={{color: 'white'}}>
                {props.children}
            </Button>
        </MuiThemeProvider>
    );
}