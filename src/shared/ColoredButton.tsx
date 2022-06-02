import {Button, createTheme, ThemeProvider} from "@mui/material";
import {ButtonProps} from "@mui/material/Button/Button";
import {OverwriteType} from "../util/TypeUtils";

export type ColoredButtonProps = OverwriteType<ButtonProps, { color: string }>

const createButtonTheme = ({darkMode, color}: { darkMode: boolean, color: string }) =>
    createTheme({
        palette: {
            mode: darkMode ? "dark" : "light",
            primary: {
                main: color
            }
        }
    });

export function ColoredButton(props: ColoredButtonProps) {
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
