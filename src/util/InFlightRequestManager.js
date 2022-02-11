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

    return {
        send
    };
}

export default InFlightRequestManager;