import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: 'light', // default mode
        primary: {
            light: '#ff6659',
            main: '#D60000',
            dark: '#950000',
        },
        secondary: {
            light: '#D9D9D9',
            main: '#464646',
            dark: '#313131',
        },
        background: {
            default: '#fff',
            paper: '#fff',
        },
    },
    typography: {
        fontFamily: [
            'Outfit',
        ]
    }
});

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            light: '#ff6659',
            main: '#D60000',
            dark: '#950000',
        },
        secondary: {
            light: '#D9D9D9',
            main: '#464646',
            dark: '#313131',
        },
        background: {
            default: '#333',
            paper: '#444',
        },
    },
});

export default theme;
