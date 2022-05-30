import {Card, CardContent, Typography} from "@mui/material";
import {AppUrls} from "../Constants";
import NewTabLink from "../shared/NewTabLink.tsx";

const styles = {
    container: {
        margin: '15px'
    },
    contentCard: {
        marginBottom: '15px',
    },
}

function ContentSection({title, children}) {
    return (
        <>
            <Typography variant={'h5'}>
                {title}
            </Typography>

            <Card style={styles.contentCard}>
                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </>
    )
}

function AboutPage() {

    return (
        <div style={styles.container}>
            <>
                <ContentSection title={'About Nihongo Stats'}>
                    Nihongo Stats is a stats aggregation tool for Japanese language learning apps.

                    <p>
                        It was inspired by <NewTabLink href={AppUrls.wkStats}>Wanikani Stats</NewTabLink> (aka WK
                        Stats).<br/>
                        WK Stats is still a great website for tracking your Japanese progression but the project now
                        longer appears to be maintained.
                    </p>

                    <p>
                        Learning Japanese is a long and difficult process, and as you advance passed the beginner
                        stages it becomes more difficult to feel like you are progressing. <br/>
                        This can lead to burn out and lack of motivation. Nihongo Stats's goals is to make tracking your
                        Japanese progress across all learning platforms easy to visualize.
                    </p>
                </ContentSection>

                <ContentSection title={'Supported Apps'}>
                    Anki, BunPro, and Wanikani are the currently supported apps, but I am hoping for that number
                    to grow. <br/>
                    If you would like to request an app to be added, please raise an issue in the <NewTabLink
                    href={AppUrls.githubIssuesPage}>GitHub Issues</NewTabLink> page.
                </ContentSection>

                <ContentSection title={'Open Source Project'}>
                    Nihongo Stats is an Open Source project hosted on <NewTabLink
                    href={AppUrls.githubPage}>GitHub</NewTabLink>.<br/>
                    Feel free to look through the source code and consider contributing if you are interested.

                </ContentSection>

                <ContentSection title={'Other Helpful Sites'}>
                    Below are some other great tools created by various community members.

                    <li>
                        <NewTabLink href={AppUrls.wkStats}>Wanikani Statistics</NewTabLink>&nbsp;
                        - Original WK Stats website.
                    </li>

                    <li>
                        <NewTabLink href={AppUrls.wanikaniHistory}>Wanikani History</NewTabLink>&nbsp;
                        - An alternative Wanikani Stats visualization tool similar to Nihongo Stats
                    </li>

                </ContentSection>

            </>
        </div>
    );
}

export default AboutPage;
