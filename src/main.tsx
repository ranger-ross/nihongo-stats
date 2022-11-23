import React from 'react'
import App from './App'
import {createRoot} from 'react-dom/client';
import {BrowserTracing} from "@sentry/tracing";
import * as Sentry from "@sentry/react";
import {useAppVersion} from "./hooks/useAppVersion";

try {
    Sentry.init({
        dsn: "https://15b4201ec2eb4677be9f58c25f66ff05@o4504206450556928.ingest.sentry.io/4504206451998720",
        integrations: [new BrowserTracing()],

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
        release: useAppVersion()
    });
} catch (error) {
    console.error('failed to setup sentry', error);
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App/>);
