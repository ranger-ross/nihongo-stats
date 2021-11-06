import makeStyles from "@material-ui/core/styles/makeStyles";
import { Chart, LineSeries, SplineSeries } from '@devexpress/dx-react-chart-material-ui';

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

    return (
        <div className={classes.container}>
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