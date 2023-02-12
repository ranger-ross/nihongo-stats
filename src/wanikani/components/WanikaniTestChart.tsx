import { Card, CardContent } from "@mui/material";
import React, { useMemo } from "react";
import {  AxisOptions, Chart } from "react-charts";



type DailyStars = {
  date: Date,
  stars: number,
}

type Series = {
  label: string,
  data: DailyStars[]
}

const data: Series[] = [
  {
    label: 'React Charts',
    data: [
      {
        date: new Date(),
        stars: 10,
      }
      // ...
    ]
  },
  {
    label: 'React Query',
    data: [
      {
        date: new Date(),
        stars: 20,
      }
      // ...
    ]
  }
]

function WanikaniTestChart() {
  const primaryAxis = useMemo(
    (): AxisOptions<DailyStars> => ({
      getValue: datum => datum.date,
    }),
    []
  )

  const secondaryAxes = useMemo(
    (): AxisOptions<DailyStars>[] => [
      {
        getValue: datum => datum.stars,
      },
    ],
    []
  )

  return (
    <Card style={{height: '100%'}}>
      <CardContent style={{height: '100px'}}>
        <Chart
          options={{
            data,
            primaryAxis,
            secondaryAxes,
            dark: true
          }}
        />
      </CardContent>
    </Card>
  )
}

export default WanikaniTestChart;