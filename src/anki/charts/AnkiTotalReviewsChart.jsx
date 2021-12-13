import { Card, CardContent, Typography, Grid } from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useEffect, useState } from "react";
import { truncDate } from "../../util/DateUtils";
import AnkiApiService from "../service/AnkiApiService";
import { Chart, ValueAxis, ArgumentAxis, Tooltip } from '@devexpress/dx-react-chart-material-ui';
import { LineSeries } from "@devexpress/dx-react-chart";
import { EventTracker } from "@devexpress/dx-react-chart";

const useStyles = makeStyles({
    container: {
    }
});


function DataPoint(date, previousTotalCount) {
    let dp = {
        date: truncDate(date),
        reviews: [],
        count: 0,
        totalCount: previousTotalCount
    };

    dp.addReview = (review) => {
        dp.reviews.push(review);
        dp.count = dp.reviews.length;
        dp.totalCount = previousTotalCount + dp.count;
    };

    return dp;
}

function formatReviewData(reviews) {
    const orderedReviews = reviews.sort((a, b,) => a.reviewTime - b.reviewTime);
    let days = [new DataPoint(orderedReviews[0].reviewTime, 0)];

    for (const review of orderedReviews) {
        let lastDay = days[days.length - 1];
        if (lastDay.date.getTime() != truncDate(review.reviewTime).getTime()) {
            days.push(new DataPoint(review.reviewTime, lastDay.totalCount));
            lastDay = days[days.length - 1];
        }
        lastDay.addReview(review);
    }
    return days;
}

function AnkiTotalReviewsChart({ deckNames }) {
    const classes = useStyles();

    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        AnkiApiService.getCardReviews(deckNames[0]) // TODO: All multi deck support
            .then(reviews => {
                setReviews(formatReviewData(reviews))
            });
    }, []);



    function ReviewToolTip(props) {
        const dataPoint = reviews[props.targetItem.point];
        return (
            <>
                <p>{new Date(dataPoint.date).toLocaleDateString()}</p>
                <p>Count: {dataPoint.totalCount.toLocaleString()}</p>
            </>
        );
    }

    return (
        <Card>
            <CardContent>

                <Grid item xs={12}>
                    <Typography variant={'h5'} style={{ textAlign: 'center' }}>
                        Total Reviews
                    </Typography>
                </Grid>

                <Chart data={reviews}>
                    <ValueAxis />
                    <ArgumentAxis
                        tickFormat={scale => text => new Date(text).toLocaleDateString()}
                    />
                    <LineSeries
                        name="total"
                        valueField="totalCount"
                        argumentField="date"
                    />

                    <EventTracker />
                    <Tooltip contentComponent={ReviewToolTip} />
                </Chart>

            </CardContent>
        </Card>
    );
}

export default AnkiTotalReviewsChart;