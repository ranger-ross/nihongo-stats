import { Button } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import React from "react";
import { useNavigate, useLocation } from "react-router";

const useStyles = makeStyles({
    button: {
        marginLeft: '13px'
    }
});

function NavButton({ text, route }) {
    const classes = useStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const isSelected = route === location.pathname;

    return (
        <Button variant={isSelected ? 'contained' : 'outlined'}
            color="primary"
            className={classes.button}
            onClick={() => navigate(route, { replace: true })}
        >
            {text}
        </Button>
    );
}

export default NavButton;