import makeStyles from "@material-ui/core/styles/makeStyles";
import {useEffect, useState} from "react";
import AnkiReviewsChart from "./charts/AnkiReviewsChart";
import AnkiApiService from "./service/AnkiApiService";
import {useNavigate} from "react-router";
import {RoutePaths} from "../Routes";

const useStyles = makeStyles({
    container: {
        margin: '5px',
        display: 'flex',
        gap: '10px',
        flexDirection: 'column'
    }
});


function AnkiDashboard() {
    const classes = useStyles();
    const navigate = useNavigate();

    useEffect(() => {
        AnkiApiService.connect()
            .then(() => {

            })
            .catch(() => navigate(RoutePaths.ankiConnect, {replace: true}));


    }, []);

    return (
        <div className={classes.container}>
            Anki Dashboard
        </div>
    );
}

export default AnkiDashboard;