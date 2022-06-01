import {Button, Card, CardContent, Container, Typography} from "@mui/material";
import {Navigate} from "react-router";
import {useSelectedApp} from "../hooks/useSelectedApp";
import {AppNames} from "../Constants";
import create from "zustand";
import {useUserPreferences} from "../hooks/useUserPreferences";
// @ts-ignore
import {convertAppNameToDashboardRoute} from "../Routes.jsx";
import {AppStyles} from "../util/TypeUtils";

const styles: AppStyles = {
    container: {
        textAlign: 'center',
        marginTop: '15vh'
    },
    topTitle: {
        marginBottom: '50px'
    },
}

const storageService = {
    saveLandingPage: (value: boolean) => localStorage.setItem('landing-page-read', String(value)),
    loadLandingPage: () => Boolean(localStorage.getItem('landing-page-read')),
};

type LandingPageState = {
    isLandingPageRead: boolean,
    markAsRead: () => void
};

export const useIsLandingPageRead = create<LandingPageState>(set => ({
    isLandingPageRead: storageService.loadLandingPage(),
    markAsRead: () => set(() => {
        storageService.saveLandingPage(true);
        return {isLandingPageRead: true};
    }),
}));

function LandingPage() {
    const {selectedApp, setSelectedApp} = useSelectedApp();
    const {isLandingPageRead, markAsRead} = useIsLandingPageRead();
    const {globalPreferences} = useUserPreferences();

    if (isLandingPageRead) {
        const defaultDashboard = globalPreferences.defaultDashboard ?? AppNames.overview;

        if (selectedApp === defaultDashboard) {
            const dashboardRoute = convertAppNameToDashboardRoute(defaultDashboard);
            return (<Navigate to={dashboardRoute.path} replace={true}/>);
        } else {
            setSelectedApp(defaultDashboard);
        }
        return null;
    }

    return (
        <div style={styles.container}>
            <Typography variant={'h4'} style={styles.topTitle}>
                Welcome to Nihongo Stats
            </Typography>

            <Container maxWidth={'md'}>
                <Card>
                    <CardContent>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                            <Typography variant={'body1'} style={{marginBottom: '20px', maxWidth: '600px'}}>
                                Nihongo Stats is a stats aggregation tool for Japanese language
                                learning platforms like Anki, BunPro, and Wanikani.
                            </Typography>
                        </div>

                        <Typography variant={'body1'} style={{marginBottom: '20px'}}>
                            Learning Japanese is hard. And its even harder when you can't see your progress.
                        </Typography>

                        <Button variant={'contained'}
                                onClick={markAsRead}
                        >
                            Go to Dashboard
                        </Button>


                    </CardContent>
                </Card>

            </Container>
        </div>
    );
}

export default LandingPage;
