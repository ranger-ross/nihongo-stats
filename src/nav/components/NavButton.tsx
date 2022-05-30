import {Button} from "@mui/material";
import React from "react";
import {useNavigate, useLocation} from "react-router";

const styles = {
    button: {
        marginLeft: '13px'
    }
};

type AppRoute = { // TODO: Use AppRoute from Routes in src dir once its migrated to typescript
    path: string,
    appName: string,
    hideNav: boolean,
}

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
