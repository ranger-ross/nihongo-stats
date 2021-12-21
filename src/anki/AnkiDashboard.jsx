import {useEffect, useState} from "react";
import AnkiApiService from "./service/AnkiApiService";
import {useNavigate} from "react-router";
import {RoutePaths} from "../Routes";
import AnkiDeckSummaries from "./components/AnkiDeckSummaries.jsx";
import AnkiCardBreakDownChart from "./components/AnkiCardBreakDownChart.jsx";
import AnkiApiProvider from "./components/AnkiApiProvider.jsx";

const styles = {
    container: {
        margin: '5px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap'
    },
    leftContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minWidth: '425px',
    },
    rightContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
};

function AnkiDashboard() {
    return (
        <AnkiApiProvider>
            <div style={styles.container}>
                <div style={styles.leftContainer}>
                    <AnkiDeckSummaries/>
                    <AnkiCardBreakDownChart/>
                </div>
                <div style={styles.rightContainer}>
                    placeholder right
                </div>
            </div>
        </AnkiApiProvider>
    );
}

export default AnkiDashboard;