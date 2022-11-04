import {Button} from "@mui/material";
import React from "react";
import {useLocation, useNavigate} from "react-router";
import {AppRoute} from "../../Routes";

const styles = {
    button: {
        marginLeft: '13px'
    }
};

type Props = {
    text: string,
    route: AppRoute,
};

function NavButton({text, route}: Props) {
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
