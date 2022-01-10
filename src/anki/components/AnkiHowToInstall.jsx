import {
    Accordion,
    AccordionSummary, Button,
    Link,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import {useState} from "react";
import * as React from "react";
import macosAnkiAddOns from '../../../assets/anki/macos/anki-add-ons.png'
import macosAnkiGetAddOns from '../../../assets/anki/macos/anki-get-add-ons.png'
import macosAnkiInstallAddOns from '../../../assets/anki/macos/anki-install-add-ons.png'
import macosAnkiRequestPermission from '../../../assets/anki/macos/anki-request-permission.png'
import windowsAnkiAddOns from '../../../assets/anki/windows/anki-add-ons.png'
import windowsAnkiGetAddOns from '../../../assets/anki/windows/anki-get-add-ons.png'
import windowsAnkiInstallAddOns from '../../../assets/anki/windows/anki-install-add-ons.png'
import windowsAnkiRequestPermission from '../../../assets/anki/windows/anki-request-permission.png'


const windows = 'Windows';
const macos = 'Mac OS';


function OsSelector({options, os, setOs}) {
    return (
        <ToggleButtonGroup
            value={os}
            exclusive
            onChange={e => setOs(e.target.value)}
        >
            {options.map(option => (
                <ToggleButton key={option} value={option}>{option}</ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}


function AnkiHowToInstall({onConnect}) {
    const [os, setOs] = useState(windows);

    const isWindows = os === windows;
    const isMacOs = os === macos;

    return (
        <Accordion style={{textAlign: 'left'}}>
            <AccordionSummary>
                Installation instructions
            </AccordionSummary>

            <div style={{marginLeft: '10px'}}>

                <OsSelector options={[windows, macos]}
                            os={os}
                            setOs={setOs}
                />

                <Typography variant={'h5'} textAlign={'left'} marginTop={3}>
                    Step 1
                </Typography>
                <Typography variant={'body1'} textAlign={'left'} marginTop={2} marginBottom={2}>
                    Open the Add-Ons page in Anki
                </Typography>

                {isWindows ? (
                    <>
                        <img style={{margin: '10px'}} height={400} src={windowsAnkiAddOns}/>
                        <img style={{margin: '10px'}} height={400} src={windowsAnkiGetAddOns}/>
                    </>
                ) : (
                    <>
                        <img style={{margin: '10px'}} height={500} src={macosAnkiAddOns}/>
                        <img style={{margin: '10px'}} height={500} src={macosAnkiGetAddOns}/>
                    </>
                )}


                <Typography variant={'h5'} textAlign={'left'} marginTop={3}>
                    Step 2
                </Typography>

                <Typography variant={'body1'} textAlign={'left'} marginTop={2} marginBottom={2}>
                    Install <Link href="https://ankiweb.net/shared/info/2055492159"
                                  target="_blank">AnkiConnect Add-On</Link> by entering <code
                    style={{color: 'orange'}}>2055492159</code> in the Code field
                </Typography>


                {isWindows ? (
                    <img style={{margin: '10px'}} height={300} src={windowsAnkiInstallAddOns}/>
                ) : (
                    <img style={{margin: '10px'}} height={500} src={macosAnkiInstallAddOns}/>
                )}

                <Typography variant={'h5'} textAlign={'left'} marginTop={3}>
                    Step 3
                </Typography>

                <Typography variant={'body1'} textAlign={'left'} marginTop={2} marginBottom={2}>
                    Restart Anki
                </Typography>


                <Typography variant={'h5'} textAlign={'left'} marginTop={3}>
                    Step 4
                </Typography>

                <Typography variant={'body1'} textAlign={'left'} marginTop={2} marginBottom={2}>
                    Click
                    <Button variant={'contained'}
                            color={'primary'}
                            onClick={onConnect}
                            size={'small'}
                            style={{marginLeft: '5px', marginRight: '5px'}}
                    >
                        Connect
                    </Button>and allow permission to Nihongo Stats
                </Typography>

                {isWindows ? (
                    <img style={{margin: '10px'}} height={200} src={windowsAnkiRequestPermission}/>
                ) : (
                    <img style={{margin: '10px'}} height={200} src={macosAnkiRequestPermission}/>
                )}

                {isMacOs ? (
                    <>
                        <Typography variant={'h5'} textAlign={'left'} marginTop={3}>
                            Step 5 (Optional)
                        </Typography>

                        <Typography variant={'body1'} textAlign={'left'} marginTop={2} marginBottom={2}>
                            MacOS has a feature called AppNap that is meant to save battery life. But this can sometimes
                            lead to long loading times for Anki data. <br/>
                            You can disable AppNap for Anki by running the
                            following commands in a terminal. Read more <Link
                            href={'https://github.com/FooSoft/anki-connect#notes-for-macos-users'}
                            target={'_blank'}>here</Link>
                        </Typography>

                        <code>
                            defaults write net.ankiweb.dtop NSAppSleepDisabled -bool true <br/>
                            defaults write net.ichi2.anki NSAppSleepDisabled -bool true <br/>
                            defaults write org.qt-project.Qt.QtWebEngineCore NSAppSleepDisabled -bool true
                        </code>
                        <div style={{marginBottom: '25px'}}/>
                    </>
                ) : null}


            </div>


        </Accordion>
    );
}

export default AnkiHowToInstall;