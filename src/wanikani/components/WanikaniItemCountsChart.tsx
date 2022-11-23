import {Card, CardContent, CircularProgress, Tooltip, Typography} from "@mui/material";
import {WANIKANI_COLORS} from "../../Constants";
import {AppStyles} from "../../util/TypeUtils";
import {WanikaniAssignment} from "../models/WanikaniAssignment";
import {ErrorBoundary} from "react-error-boundary";
import {GenericErrorMessage} from "../../shared/GenericErrorMessage";
import React from "react";


type FormattedDataPoint = {
    total: number,
    radicals: number,
    kanji: number,
    vocabulary: number,
};

type FormattedData = {
    available: FormattedDataPoint,
    apprentice: FormattedDataPoint,
    guru: FormattedDataPoint,
    master: FormattedDataPoint,
    enlightened: FormattedDataPoint,
    burned: FormattedDataPoint,
};

const styles: AppStyles = {
    topContainer: {
        display: 'flex',
        gap: '5px',
        justifyContent: 'space-around'
    },
    bottomContainer: {
        display: 'flex',
        gap: '5px',
        justifyContent: 'space-around',
        marginTop: '10px'
    },
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '135px'
    },
};

function assignmentsToCounts(assignments: WanikaniAssignment[]): FormattedDataPoint {
    return {
        total: assignments.length,
        radicals: assignments.filter(assignment => assignment.subjectType === 'radical').length,
        kanji: assignments.filter(assignment => assignment.subjectType === 'kanji').length,
        vocabulary: assignments.filter(assignment => assignment.subjectType === 'vocabulary').length,
    };
}

type CountTileProps = {
    label: string,
    data: FormattedDataPoint,
    color: string,
};

function CountTile({label, data, color}: CountTileProps) {
    return (
        <Tooltip title={
            <div>
                <p>Radicals: {data?.radicals}</p>
                <p>Kanji: {data?.kanji}</p>
                <p>Vocabulary: {data?.vocabulary}</p>
            </div>
        } placement={'top'}>
            <div style={{
                textAlign: 'center',
                width: 'fit-content',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <div style={{
                    background: color,
                    padding: '5px',
                    width: '60px',
                    borderRadius: '5px',
                    boxShadow: 'rgba(0, 0, 0, 0.3) 5px 4px 10px',
                }}>
                    {data?.total}
                </div>

                <div style={{marginTop: '5px'}}>
                    <Typography variant={'caption'} color={'textPrimary'}>
                        {label}
                    </Typography>
                </div>
            </div>
        </Tooltip>
    );
}

function formatData(assignments: WanikaniAssignment[]): FormattedData {
    const available = assignments.filter(assignment => assignment.srsStage == 0);
    const apprentice = assignments.filter(assignment => assignment.srsStage > 0 && assignment.srsStage < 5);
    const guru = assignments.filter(assignment => assignment.srsStage >= 5 && assignment.srsStage < 7);
    const master = assignments.filter(assignment => assignment.srsStage >= 7 && assignment.srsStage < 8);
    const enlightened = assignments.filter(assignment => assignment.srsStage >= 8 && assignment.srsStage < 9);
    const burned = assignments.filter(assignment => assignment.srsStage >= 9);

    return {
        available: assignmentsToCounts(available),
        apprentice: assignmentsToCounts(apprentice),
        guru: assignmentsToCounts(guru),
        master: assignmentsToCounts(master),
        enlightened: assignmentsToCounts(enlightened),
        burned: assignmentsToCounts(burned),
    };
}

type WanikaniItemCountsChartProps = {
    assignments: WanikaniAssignment[]
};

function WanikaniItemCountsChart({assignments}: WanikaniItemCountsChartProps) {
    const data = formatData(assignments);
    return (
        <Card>
            <CardContent>

                {!data ? (
                    <div style={styles.loadingContainer}>
                        <CircularProgress/>
                    </div>
                ) : (
                    <>
                        <div style={styles.topContainer}>
                            <CountTile
                                label={'Available'}
                                data={data?.available}
                                color={'#686868'}
                            />

                            <CountTile
                                label={'Apprentice'}
                                data={data?.apprentice}
                                color={WANIKANI_COLORS.pink}
                            />

                            <CountTile
                                label={'Guru'}
                                data={data?.guru}
                                color={WANIKANI_COLORS.purple}
                            />
                        </div>

                        <div style={styles.bottomContainer}>
                            <CountTile
                                label={'Master'}
                                data={data?.master}
                                color={'#3556dd'}
                            />

                            <CountTile
                                label={'Enlightened'}
                                data={data?.enlightened}
                                color={'#0098e5'}
                            />

                            <CountTile
                                label={'Burned'}
                                data={data?.burned}
                                color={'#474647'}
                            />
                        </div>
                    </>
                )}


            </CardContent>
        </Card>
    );
}

// Wrapper to catch any errors
function WanikaniItemCountsChartErrorWrapper(props: WanikaniItemCountsChartProps) {
    return (
        <ErrorBoundary FallbackComponent={GenericErrorMessage}>
            <WanikaniItemCountsChart {...props} />
        </ErrorBoundary>
    );
}

export default WanikaniItemCountsChartErrorWrapper;
