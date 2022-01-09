import {Button, createTheme, ThemeProvider} from "@mui/material";
import {WanikaniColors} from "../../Constants";

const createPinkButtonTheme = ({darkMode}) =>
    createTheme({
        palette: {
            type: darkMode ? "dark" : "light",
            primary: {
                main: WanikaniColors.pink
            }
        },
    });

export function WanikaniPinkButton(props) {
    const theme = createPinkButtonTheme(true);
    return (
        <ThemeProvider theme={theme}>
            <Button {...props} color={'primary'}>
                {props.children}
            </Button>
        </ThemeProvider>
    );
}

const createBlueButtonTheme = ({darkMode}) =>
    createTheme({
        palette: {
            type: darkMode ? "dark" : "light",
            primary: {
                main: WanikaniColors.blue
            }
        }
    });

export function WanikaniBlueButton(props) {
    const theme = createBlueButtonTheme(true);
    return (
        <ThemeProvider theme={theme}>
            <Button {...props} color={'primary'} style={{color: 'white'}}>
                {props.children}
            </Button>
        </ThemeProvider>
    );
}