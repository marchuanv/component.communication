import {
    ConnectionOptions,
    ContentType,
    Properties,
    createServer,
    randomUUID,
    request
} from '../registry.mjs';
const contentType = new ContentType('json');
export class HttpConnection extends Properties {
    /**
     * @param { ConnectionOptions } connectionOptions
    */
    constructor(connectionOptions) {
        super();
        super.set('Id', randomUUID());
        super.set('connectionOptions', connectionOptions);
        super.set('message', null);
        const server = createServer();
        super.set('server', server);
        super.set('retryCount', 0);
        Object.freeze(this);
    }
    /**
     * @returns { { headers: Object, body: { Id: String, data: String } } }
    */
    receive() {
        const promises = [];

        const clientPromise = new Promise((resolve, reject) => {
            super.set('clientPromise', { resolve, reject, promise: null });
        });
        super.get('clientPromise').promise = clientPromise;
        promises.push(clientPromise);

        const serverPromise = new Promise((resolve, reject) => {
            super.set('serverPromise', { resolve, reject, promise: null });
        });
        super.get('serverPromise').promise = serverPromise;
        promises.push(serverPromise);

        super.onceSet('client_message', (_message) => {
            if (!super.get('serverListeningForMessage')) {
                super.get('serverPromise').resolve(_message);
            }
            super.get('clientPromise').resolve(_message);
        });

        super.onceSet('server_message', (_message) => {
            if (!super.get('clientSentMessage')) {
                super.get('clientPromise').resolve(_message);
            }
            super.get('serverPromise').resolve(_message);
        });

        super.onceSet('error', (_error) => {
            if (super.get('clientSentMessage')) {
                super.get('clientPromise').reject(_error);
            }
            if (super.get('serverListeningForMessage')) {
                super.get('serverPromise').reject(_error);
            }
        });

        return promises;
    }
    /**
     * @param { { headers: Object, body: { Id: String, data: String } } } message
     * @returns {{ Id: String, data: String }}
    */
    send(message) {
        const { headers, body } = message || {};
        const { Id, data } = body || {};
        if (!headers || !body || !Id || !data) {
            throw new Error(`message argument does not match template: { headers: Object, body: { Id: String, data: String } }`);
        }
        const dataToSend = JSON.stringify({ Id, data });
        const { timeoutMilli, maxRetryCount, remoteHost, remotePort } = this.get('connectionOptions');
        const requestUrl = `${remoteHost}:${remotePort}/${Id}`;
        delete headers["content-length"];
        headers["Content-Length"] = Buffer.byteLength(dataToSend);
        console.log(`sending request to ${requestUrl}`);
        const req = request({
            host: remoteHost,
            port: remotePort,
            path: `/${Id}`,
            method: "POST",
            timeout: timeoutMilli,
            headers
        }, (response) => {

            let body = '';
            response.on('data', chunk => body = body + chunk);
            response.on('end', async () => {
                console.log(`recieved response from ${requestUrl}`);
                const message = JSON.parse(body);
                const { Id, data } = message || {};
                if (!Id || !data) {
                    super.set('error', new Error(
                        'message argument does not match template: { headers: Object, body: { Id: String, data: String } }'
                    ));
                }
                const responseMessage = {
                    headers: response.headers,
                    body: {
                        Id,
                        data
                    }
                };
                this.set('client_message', responseMessage);
            });
        });
        req.on('error', async (error) => {
            super.set('clientSentMessage', false);
            console.error(error);
            let retryCount = super.get('retryCount');
            console.error(`error sending request, re-trying: ${retryCount} of ${maxRetryCount}`);
            if (retryCount <= maxRetryCount) {
                retryCount = retryCount + 1;
                super.set('retryCount', retryCount);
                await this.send(message);
            } else {
                super.set('error', new Error(`exceed max retry: ${maxRetryCount}`));
            }
        });
        req.write(dataToSend);
        req.end();
        super.set('clientSentMessage', true);
    }
    /**
     * @returns { Promise }
    */
    open() {
        const server = super.get('server');
        const connectionOptions = this.get('connectionOptions');
        const { host, port } = connectionOptions;
        server.on("error", async (hostError) => {
            super.set('serverListeningForMessage', false);
            if (host) {
                dns.lookup(host, async (dnsErr) => {
                    if (dnsErr) {
                        console.error(new Error(`error hosting on ${host}:${port}, error: ${dnsErr.message}`));
                    }
                });
            }
            console.error(hostError);
            this.set('error', hostError);
        });
        server.on("request", (request, response) => {
            let body = '';
            request.on('error', (error) => super.set('error', error));
            request.on('data', chunk => body = body + chunk);
            request.on('end', () => {
                let statusCode = 201;
                let statusMessage = 'Success';
                let resHeaders = { 'Content-Type': contentType.description };
                let content = JSON.stringify({ Id: null, message: null });
                const message = JSON.parse(body);
                const { Id, data } = message || {};
                if (Id && data) {
                    content = JSON.stringify({ Id, data: 'message received and is valid' });
                } else {
                    statusCode = 422;
                    statusMessage = '422 Unprocessable Content';
                    content = JSON.stringify({ Id: null, data: 'message received does not match template: { Id: String, data: String }' });
                }
                response.writeHead(statusCode, statusMessage, resHeaders).end(content);
                this.set('server_message', {
                    headers: request.headers,
                    body: {
                        Id,
                        data
                    }
                });
            });
        });
        server.on("listening", () => {
            super.set('serverListeningForMessage', true);
            console.log(`server is listening on : ${JSON.stringify({ host, port })}`);
        });
        server.listen(connectionOptions);
    }
}
