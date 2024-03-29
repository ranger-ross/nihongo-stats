import {PropsWithChildren, useEffect, useState} from "react";
import AnkiApiService from "../service/AnkiApiService";
import {RoutePaths} from "../../Routes";
import {useNavigate} from "react-router";
import {CircularProgress} from "@mui/material";

function AnkiApiProvider({children}: PropsWithChildren<any>) {
    const navigate = useNavigate();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        AnkiApiService.connect()
            .then(() => setIsConnected(true))
            .catch(() => navigate(RoutePaths.ankiConnect.path, {replace: true}));
    }, []);

    return (
        isConnected ? (
            <>
                {children}
            </>
        ) : (
            <div style={{display: 'flex', justifyContent: 'center', margin: '20%'}}>
                <CircularProgress/>
            </div>
        )
    );
}

export default AnkiApiProvider;
