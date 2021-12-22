import {
    Accordion,
    AccordionSummary,
    Card,
    CardContent,
    Link,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import {useState} from "react";
import * as React from "react";
import ankiAddOns from '../../../assets/anki/macos/anki-add-ons.png'
import ankiGetAddOns from '../../../assets/anki/macos/anki-get-add-ons.png'
import ankiInstallAddOns from '../../../assets/anki/macos/anki-install-add-ons.png'


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
                <ToggleButton value={option}>{option}</ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
}


function AnkiHowToInstall() {
    const [os, setOs] = useState(windows);

    const isWindows = os === windows;

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
                    </>
                ) : (
                    <>
                        <img style={{margin: '10px'}} height={500} src={ankiAddOns}/>
                        <img style={{margin: '10px'}} height={500} src={ankiGetAddOns}/>

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
                    <>
                    </>
                ) : (
                    <>
                        <img style={{margin: '10px'}} height={500} src={ankiInstallAddOns}/>
                    </>
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
                    Click Connect and Allow permission to Nihongo Stats
                </Typography>
            </div>


        </Accordion>
    );
}

export default AnkiHowToInstall;