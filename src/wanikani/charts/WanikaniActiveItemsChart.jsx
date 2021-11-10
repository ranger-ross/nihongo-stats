import { Chart, ValueAxis, BarSeries, ArgumentAxis, Title, Tooltip } from '@devexpress/dx-react-chart-material-ui';
import { useWanikaniApiKey } from "../stores/WanikaniApiKeyStore";
import { useState, useEffect } from "react";
import WanikaniApiService from "../service/WanikaniApiService";
import { Animation, EventTracker } from "@devexpress/dx-react-chart";
import { Card, CardContent, ButtonGroup, Button, Typography, Box } from "@material-ui/core";
import { addDays, areDatesSameDay } from '../../util/DateUtils';
import { wanikaniColors } from "../../Constants";

const racialColor = wanikaniColors.blue;
const kanjiColor = wanikaniColors.pink;
const vocabularyColor = wanikaniColors.purple;

function ItemTile({ text, type }) {
    let color;
    switch (type) {
        case 'radical':
            color = racialColor;
            break;
        case 'kanji':
            color = kanjiColor;
            break;
        case 'vocabulary':
            color = vocabularyColor;
            break;
    }
    return (
        <div style={{ color: color, width: 'fit-content' }}>
            {text}
        </div>
    );
}


function WanikaniActiveItemsChart() {
    const { apiKey } = useWanikaniApiKey();
    const [data, setData] = useState({
        radicals: [],
        kanji: [],
        vocabulary: [],
    })

    useEffect(() => {
        WanikaniApiService.getUser(apiKey)
            .then(async (user) => {
                const currentLevel = user.data.level;
                const data = await WanikaniApiService.getSubjects(apiKey);
                const items = data.filter(subject => subject.data.level === currentLevel)

                const radicals = items.filter(subject => subject.object === 'radical')
                const kanji = items.filter(subject => subject.object === 'kanji')
                const vocabulary = items.filter(subject => subject.object === 'vocabulary')
                setData({
                    radicals,
                    kanji,
                    vocabulary
                });
            })
    }, []);


    return (
        <Card>
            <CardContent>
                Radicals
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {data.radicals.map(radical => (
                        <ItemTile key={radical.id}
                            text={radical.data.characters}
                            type={'radical'}
                        />
                    ))}
                </div>

                Kanji
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {data.kanji.map(kanji => (
                        <ItemTile key={kanji.id}
                            text={kanji.data.characters}
                            type={'kanji'}
                        />
                    ))}

                </div>

                Vocabulary
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {data.vocabulary.map(vocabulary => (
                        <ItemTile key={vocabulary.id}
                            text={vocabulary.data.characters}
                            type={'vocabulary'}
                        />
                    ))}
                </div>

            </CardContent>
        </Card>
    );
}

export default WanikaniActiveItemsChart;