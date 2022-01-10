import {Button, Card, CardContent, Container, Typography} from "@mui/material";
import {Navigate} from "react-router";
import {RoutePaths} from "../Routes.jsx";
import {useSelectedApp} from "../hooks/useSelectedApp.jsx";
import {AppNames} from "../Constants.js";
import create from "zustand";

const styles = {
    container: {
        textAlign: 'center',
        marginTop: '15vh'
    },
    topTitle: {
        marginBottom: '50px'
    },
}

const storageService = {
    saveLandingPage: app => localStorage.setItem('landing-page-read', app),
    loadLandingPage: () => localStorage.getItem('landing-page-read'),
};

export const useIsLandingPageRead = create(set => ({
    isLandingPageRead: !!storageService.loadLandingPage(),
    markAsRead: () => set(() => {
        storageService.saveLandingPage(true);
        return {isLandingPageRead: true};
    }),
}));

function LandingPage() {
    const {selectedApp, setSelectedApp} = useSelectedApp();
    const {isLandingPageRead, markAsRead} = useIsLandingPageRead();

    if (isLandingPageRead) {
        if (selectedApp === AppNames.overview) {
            return (<Navigate to={RoutePaths.overviewDashboard.path} replace={true}/>);
        } else {
            setSelectedApp(AppNames.overview);
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