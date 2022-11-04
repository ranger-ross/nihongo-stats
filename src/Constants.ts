export const APP_NAMES = {
    overview: 'overview',
    anki: 'anki',
    bunpro: 'bunpro',
    wanikani: 'wanikani',
};

export const APP_URLS = {
    apiProxy: 'https://api-proxy.nihongostats.com',

    // API URLs
    ankiApi: 'http://localhost:8765',
    bunproApi: 'https://bunpro.jp/api',
    wanikaniApi: 'https://api.wanikani.com',

    // GitHub Pages
    githubPage: 'https://github.com/ranger-ross/nihongo-stats',
    githubIssuesPage: 'https://github.com/ranger-ross/nihongo-stats/issues',
    githubReleasesPage: 'https://github.com/ranger-ross/nihongo-stats/releases',

    wkStats: 'https://www.wkstats.com/',
    wanikaniHistory: 'https://saraqael-m.github.io/WaniKaniMiscStats',

};

export const WANIKANI_COLORS = {
    blue: '#00a1f1',
    pink: '#f100a1',
    purple: '#a100f1',

    lockedGray: '#c4c4c4',
    lessonGray: '#868686',
    masterBlue: '#3556dd',
    enlightenedBlue: '#0098e5',
    burnedGray: '#343434',

    burnedOrange: '#faac05',
    burnedYellow: '#fdde9b',

    radicalGradient: () => `linear-gradient(-30deg, ${WANIKANI_COLORS.enlightenedBlue}, #54c5ff)`,
    kanjiGradient: () => `linear-gradient(-30deg, ${WANIKANI_COLORS.pink}, #fc55c5)`,
    vocabularyGradient: () => `linear-gradient(-30deg, ${WANIKANI_COLORS.purple}, #c54eff)`,

    apprenticeGradient: () => `linear-gradient(-30deg, ${WANIKANI_COLORS.pink}, #f961c7)`,
    guruGradient: () => `linear-gradient(-30deg, ${WANIKANI_COLORS.purple}, #c54eff)`,
    masterGradient: () => `linear-gradient(-30deg, ${WANIKANI_COLORS.masterBlue}, #5a78f3)`,
    enlightenedGradient: () => `linear-gradient(-30deg, ${WANIKANI_COLORS.enlightenedBlue}, rgb(122 201 241))`,
    burnedGradient: () => `linear-gradient(-30deg, ${WANIKANI_COLORS.burnedOrange}, ${WANIKANI_COLORS.burnedYellow})`,
}

export const WANIKANI_COLORS_WITH_BLACK_TEXT = new Set([
    WANIKANI_COLORS.burnedGradient(),
    WANIKANI_COLORS.lockedGray
]);


export const BUNPRO_COLORS = {
    blue: '#4191e2',
    red: '#c8534f',
}

export const ANKI_COLORS = {
    blue: '#77ccff',
    lightGreen: '#74c464',
    darkGreen: '#31a354',
    lightOrange: '#fd8d3c',
    redOrange: '#fb6a4a',
}
