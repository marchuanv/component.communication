import {
    ConnectionOptions,
    ContentType,
    EventEmitter,
    Properties,
    createServer,
    dns,
    randomUUID,
    request
} from '../../registry.mjs';
const contentType = new ContentType('json');
export class HttpConnection extends Properties {
    /**
     * @param { ConnectionOptions } connectionOptions
    */
    constructor(connectionOptions) {
        super({ name: 'connectionOptions', value: connectionOptions });
        super.set('Id', randomUUID());
        const server = createServer();
        super.set('server', server);
        super.set('isOpen', false);
        super.set('isConnecting', false);
        super.set('retryCount', 0);
        super.set('eventEmitter', new EventEmitter());
        super.set('promises', []);
        Object.freeze(this);
        const promises = super.get('promises');
        const eventEmitter = super.get('eventEmitter', EventEmitter.prototype);
        eventEmitter.on('serverEvent', (error, message) => {
            promises.push({
                serverPromise: new Promise((resolve, reject) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (message) {
                            resolve(message);
                        } else {
                            reject(new Error('critical error'));
                        }
                    }
                })
            });
        });
        eventEmitter.on('clientEvent', (error, message) => {
            promises.push({
                clientPromise: new Promise((resolve, reject) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (message) {
                            resolve(message);
                        } else {
                            reject(new Error('critical error'));
                        }
                    }
                })
            });
        });
    }
    /**
     * @returns { { headers: Object, body: { Id: String, data: String } } }
    */
    receive() {
        let { clientPromise, serverPromise } = super.get('promises').shift() || {};
        if (!clientPromise) {
            clientPromise = new Promise((resolve) => {
                resolve(null);
            });
        }
        if (!serverPromise) {
            serverPromise = new Promise((resolve) => {
                resolve(null);
            });
        }
        return [
            clientPromise,
            serverPromise
        ];
    }
    /**
     * @param { { headers: Object, body: { Id: String, data: String } } } message
     * @returns {{ Id: String, data: String }}
    */
    send(message) {
        const { headers, body } = message || {};
        const { Id, data } = body || {};
        if (!headers || !body || !Id || !data) {
            return raiseEvent.call(this, 'clientEvent', null, new Error(
                `message argument does not match template: { headers: Object, body: { Id: String, data: String } }`
            ));
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
                console.log(`recieved response from server: ${requestUrl}`);
                const message = JSON.parse(body);
                const { Id, data } = message || {};
                if (!Id || !data) {
                    raiseEvent.call(this, 'clientEvent', null, new Error(
                        'message argument does not match template: { headers: Object, body: { Id: String, data: String } }'
                    ));
                }
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    raiseEvent.call(this, 'clientEvent', {
                        headers: response.headers,
                        body: {
                            Id,
                            data
                        }
                    });
                } else {
                    raiseEvent.call(this, 'clientEvent', null, new Error(response.statusMessage));
                }
            });
        });
        req.on('error', async (error) => {
            console.error(error);
            let retryCount = super.get('retryCount');
            console.error(`error sending request, re-trying: ${retryCount} of ${maxRetryCount}`);
            if (retryCount <= maxRetryCount) {
                retryCount = retryCount + 1;
                super.set('retryCount', retryCount);
                await this.send(message);
            } else {
                const error = new Error(`exceed max retry: ${maxRetryCount}`);
                console.error(error);
                raiseEvent.call(this, 'clientEvent', null, error);
            }
        });
        req.write(dataToSend);
        req.end();
    }
    /**
     * @returns { Promise }
    */
    open() {
        const isConnecting = super.get('isConnecting');
        const isOpen = super.get('isOpen');
        if (isConnecting || isOpen) {
            return;
        }
        super.set('isConnecting', true);
        const server = super.get('server');
        const connectionOptions = this.get('connectionOptions');
        const { host, port } = connectionOptions;
        server.on("error", async (hostError) => {
            if (host) {
                dns.lookup(host, async (dnsErr) => {
                    if (dnsErr) {
                        console.error(new Error(`error hosting on ${host}:${port}, error: ${dnsErr.message}`));
                    }
                });
            }
            console.error(hostError);
            raiseEvent.call(this, 'serverEvent', null, hostError);
        });
        server.on("request", (request, response) => {
            setImmediate(() => {
                let body = '';
                request.on('error', (error) => {
                    console.error(error);
                    raiseEvent.call(this, 'serverEvent', null, error);
                });
                request.on('data', chunk => body = body + chunk);
                request.on('end', () => {
                    console.log(`server recieved request`);
                    let statusCode = 201;
                    let statusMessage = 'Success';
                    let resHeaders = { 'Content-Type': contentType.description };
                    let content = JSON.stringify({ Id: null, message: null });
                    const message = JSON.parse(body);
                    const { Id, data } = message || {};
                    if (Id && data) {
                        content = JSON.stringify({ Id, data: 'message received and is valid' });
                        raiseEvent.call(this, 'serverEvent', {
                            headers: request.headers,
                            body: {
                                Id,
                                data
                            }
                        });
                    } else {
                        statusCode = 422;
                        statusMessage = '422 Unprocessable Content';
                        const errorMsg = 'message received does not match template: { Id: String, data: String }';
                        content = JSON.stringify({ Id: null, data: errorMsg });
                        raiseEvent.call(this, 'serverEvent', null, errorMsg);
                    }
                    response.writeHead(statusCode, statusMessage, resHeaders).end(content);
                });
            });
        });
        server.on("listening", () => {
            super.set('isConnecting', false);
            super.set('isOpen', true);
            console.log(`server is listening on : ${JSON.stringify({ host, port })}`);
        });
        server.listen(connectionOptions);
    }
}

function raiseEvent(name, message, error) {
    const eventEmitter = this.get('eventEmitter', EventEmitter.prototype);
    eventEmitter.emit(name, error, message);
}