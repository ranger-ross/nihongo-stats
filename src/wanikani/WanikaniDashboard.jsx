import makeStyles from "@material-ui/core/styles/makeStyles";
import { Chart, LineSeries, SplineSeries } from '@devexpress/dx-react-chart-material-ui';
import { useWanikaniApiKey } from "./stores/WanikaniApiKeyStore";
import { Navigate } from "react-router";
import { RoutePaths } from "../Routes";

const useStyles = makeStyles({
    container: {}
});


const generateData = (start, end, step) => {
    const data = [];
    for (let i = start; i < end; i += step) {
        data.push({ splineValue: Math.sin(i) / i, lineValue: ((i / 15) ** 2.718) - 0.2, argument: i });
    }
    return data;
};

function WanikaniDashboard() {
    const classes = useStyles();
    const { apiKey } = useWanikaniApiKey();

    return (
        <div className={classes.container}>

            {!apiKey ? (<Navigate to={RoutePaths.wanikaniLogin} replace={true} />) : null}

            wanikani dashboard

            <Chart
                data={generateData(1, 4, 1)}
            >
                <LineSeries
                    valueField="lineValue"
                    argumentField="argument"
                />
                <SplineSeries
                    valueField="splineValue"
                    argumentField="argument"
                />
            </Chart>

        </div>
    );
}

export default WanikaniDashboard;