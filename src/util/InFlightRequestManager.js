function InFlightRequestManager() {
    let requests = {};

    async function send(key, request) {
        if (requests[key]) {
            return await requests[key];
        }
        try {
            let _request = request();
            requests[key] = _request;
            return await _request;
        } finally {
            delete request[key];
        }
    }

    async function extractResponseJson(response) {
        if (response.extractedBody) {
            return response.extractedBody;
        }

        const body = await response.json();
        response.extractedBody = body;
        return body;
    }

    return {
        send,
        extractResponseJson
    };
}

export default InFlightRequestManager;