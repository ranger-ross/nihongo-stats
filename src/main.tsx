import React from 'react'
import App from './App'
import {createRoot} from 'react-dom/client';
import * as Sentry from "@sentry/react";
import {useAppVersion} from "./hooks/useAppVersion";

try {
    if (useAppVersion() !== 'local-dev') {
        Sentry.init({
            dsn: "https://15b4201ec2eb4677be9f58c25f66ff05@o4504206450556928.ingest.sentry.io/4504206451998720",
            integrations: [Sentry.browserTracingIntegration()],

            // Set tracesSampleRate to 1.0 to capture 100%
            // of transactions for performance monitoring.
            // We recommend adjusting this value in production
            tracesSampleRate: 1.0,
            release: useAppVersion(),
            environment: 'production',
            beforeSend: (event) => {
                // Ignore Anki Connect errors.
                // Since we are polling, if Anki is not open there are lots of errors in the background
                if (event.request?.url?.includes('anki') ||
                    event.request?.url?.includes('localhost:8765')) {
                    console.debug('not sending anki error')
                    return null;
                }
                return event
            }
        });
    }
} catch (error) {
    console.error('failed to setup sentry', error);
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App/>);
