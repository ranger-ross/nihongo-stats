import makeStyles from "@material-ui/core/styles/makeStyles";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useGlobalState } from "../GlobalState";
import { RoutePaths } from '../Routes';
import AppSelector from "./AppSelector";
import { wanikaniAppName, bunproAppName } from '../Constants.js'

const useStyles = makeStyles({
    container: {
        padding: '5px',
        boxShadow: '0 2px 4px rgb(0 0 0 / 50%)',
    },
    selectorContainer: {
        width: '120px',
        marginLeft: '5px',
    }
});


function AppNav() {
    const { selectedApp, setSelectedApp } = useGlobalState();
    const navigate = useNavigate();
    const classes = useStyles();

    useEffect(() => {
        switch (selectedApp) {
            case wanikaniAppName:
                navigate(RoutePaths.wanikaniDashboard);
                break;
            case bunproAppName:
                navigate(RoutePaths.bunproDashboard);
                break;
        }
    }, [selectedApp])

    return (
        <div className={classes.container}>
            <div className={classes.selectorContainer}>
                <AppSelector selectedApp={selectedApp} setSelectedApp={setSelectedApp} />
            </div>
        </div>
    );
}

export default AppNav;