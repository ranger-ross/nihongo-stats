import {Button} from "@mui/material";
import React from "react";
import {useNavigate, useLocation} from "react-router";

const styles = {
    button: {
        marginLeft: '13px'
    }
};

function NavButton({text, route}) {
    const navigate = useNavigate();
    const location = useLocation();
    const isSelected = route.path === location.pathname;

    return (
        <Button variant={isSelected ? 'contained' : 'outlined'}
                color="primary"
                style={styles.button}
                onClick={() => navigate(route.path, {replace: true})}
        >
            {text}
        </Button>
    );
}

export default NavButton;