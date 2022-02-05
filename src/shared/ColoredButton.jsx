import {Button, createTheme, ThemeProvider} from "@mui/material";

const createButtonTheme = ({darkMode, color}) =>
    createTheme({
        palette: {
            type: darkMode ? "dark" : "light",
            primary: {
                main: color
            }
        }
    });

export function ColoredButton(props) {
    if (!props.color) {
        console.warn('ColoredButton requires "color" prop');
        props.color = 'lightblue';
    }
    const theme = createButtonTheme({darkMode: true, color: props.color});
    return (
        <ThemeProvider theme={theme}>
            <Button {...props} color={'primary'} style={{color: 'white'}}>
                {props.children}
            </Button>
        </ThemeProvider>
    );
}