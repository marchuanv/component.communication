import {
    ConnectionOptions,
    Container,
    ContentType,
    CtorArgs,
    EventEmitter,
    Message,
    Server,
    createServer,
    dns,
    request
} from '../../registry.mjs';
const contentType = new ContentType('json');
export class HttpConnectionCtorArgs extends CtorArgs {
    /**
     * @return { ConnectionOptions }
    */
    get connectionOptions() {
        return super.get({ connectionOptions: null });
    }
    /**
     * @param { ConnectionOptions } value
    */
    set connectionOptions(value) {
        super.set({ connectionOptions: value });
    }
}
export class HttpConnection extends Container {
    /**
     * @param { HttpConnectionCtorArgs } ctorArgs
    */
    constructor(ctorArgs) {
        super(ctorArgs);
        const server = createServer();
        super.set({ server }, Server.prototype);
        super.set({ isOpen: false }, Boolean.prototype);
        super.set({ isConnecting: false }, Boolean.prototype);
        super.set({ retryCount: 0 }, Number.prototype);
        super.set({ eventEmitter: new EventEmitter() }, EventEmitter.prototype);
        super.set({ promises: [] }, Array.prototype);
        Object.freeze(this);
        const promises = super.get({ promises: null });
        const eventEmitter = super.get({ eventEmitter: null }, EventEmitter.prototype);
        eventEmitter.on('messageEvent', (message) => {
            promises.push(new Promise((resolve, reject) => {
                if (message) {
                    resolve(message);
                } else {
                    reject(new Error('message is null or undefined'));
                }
            }));
        });
        Object.freeze(this);
    }
    /**
     * @returns { Message }
    */
    receive() {
        let promise = super.get({ promises: null }).shift();
        if (!promise) {
            promise = new Promise((resolve) => {
                resolve(null);
            });
        }
        return promise
    }
    /**
     * @param { Message } message
    */
    send(message) {
        const serialisedMessage = message.serialise();
        const { identifier } = message.headers;
        const dataToSend = serialisedMessage;
        const { timeoutMilli, maxRetryCount, remoteHostName, remoteHostPort } = super.get({ connectionOptions: null });
        const requestUrl = `${remoteHostName}:${remoteHostPort}/${identifier}`;
        const headers = {
            "Content-Length": Buffer.byteLength(dataToSend)
        };
        console.log(`sending request to ${requestUrl}`);
        const req = request({
            host: remoteHostName,
            port: remoteHostPort,
            path: `/${identifier}`,
            method: "POST",
            timeout: timeoutMilli,
            headers
        }, (response) => {
            let body = '';
            response.on('data', chunk => body = body + chunk);
            response.on('end', async () => {
                console.log(`recieved response from server: ${requestUrl}`);
                const headers = response.headers;
                headers.clientport = isNaN(headers.clientport) ? 0 : Number(headers.clientport);
                headers.responseid = headers.requestid;
                let data;
                try {
                    data = JSON.parse(body);
                } catch {
                    data = new Error('could not parse request body to json');
                }
                if (!(data instanceof Error)) {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        data = new Error(JSON.stringify({
                            statusCode: response.statusCode,
                            statusMessage: response.statusMessage
                        }));
                    } else {
                        data = data.message;
                    }
                }
                raiseEvent.call(this, { headers, data });
            });
        });
        req.on('error', async (error) => {
            console.error(error);
            let retryCount = super.get({ retryCount: null });
            console.error(`error sending request, re-trying: ${retryCount} of ${maxRetryCount}`);
            if (retryCount <= maxRetryCount) {
                retryCount = retryCount + 1;
                super.set({ retryCount }, false, false);
                await this.send(message);
            } else {
                const error = new Error(`exceed max retry: ${maxRetryCount}`);
                console.error(error);
                raiseEvent.call(this, error);
            }
        });
        req.write(dataToSend);
        req.end();
    }
    open() {
        const isConnecting = super.get({ isConnecting: null });
        const isOpen = super.get({ isOpen: null });
        if (isConnecting || isOpen) {
            return;
        }
        super.set({ isConnecting: true }, false, false);
        const server = super.get({ server: null });
        const connectionOptions = super.get({ connectionOptions: null });
        let { host, port } = {};
        ({ hostName: host, hostPort: port } = connectionOptions);
        server.on("error", async (hostError) => {
            if (host) {
                dns.lookup(host, async (dnsErr) => {
                    if (dnsErr) {
                        console.error(new Error(`error hosting on ${host}:${port}, error: ${dnsErr.message}`));
                    }
                });
            }
            console.error(hostError);
            raiseEvent.call(this, hostError);
        });
        server.on("request", (request, response) => {
            setImmediate(() => {
                let body = '';
                request.on('error', (error) => {
                    console.error(error);
                    raiseEvent.call(this, error);
                });
                request.on('data', chunk => body = body + chunk);
                request.on('end', () => {
                    console.log(`server recieved request`);
                    let statusCode = 201;
                    let statusMessage = 'Success';
                    let resHeaders = { 'Content-Type': contentType.description };
                    const headers = request.headers;
                    let data = '';
                    let receivedMessage = null;
                    if (body) {
                        try {
                            receivedMessage = Message.deserialise(body);
                            statusCode = 201;
                            statusMessage = 'Success';
                            data = { message: 'message received and is valid' };
                        } catch {
                            statusCode = 400;
                            statusMessage = '400 Bad Request';
                            data = { message: 'could not parse request body to json' };
                        }
                    } else {
                        statusCode = 400;
                        statusMessage = '400 Bad Request';
                        data = { message: 'no request body' };
                    }
                    if (statusCode >= 200 && statusCode < 300) {
                        raiseEvent.call(this, receivedMessage);
                    } else {
                        data = new Error(data);
                        raiseEvent.call(this, { headers, data: data.message });
                    }
                    data = JSON.stringify(data);
                    if (data instanceof Error) {
                        data = data.message;
                    }
                    response.writeHead(statusCode, statusMessage, resHeaders).end(data);
                });
            });
        });
        server.on("listening", () => {
            super.set({ isConnecting: false }, false, false);
            super.set({ isOpen: true }, false, false);
            console.log(`server is listening on : ${JSON.stringify({ host, port })}`);
        });
        server.listen(port, host);
    }
}
function raiseEvent(message) {
    const eventEmitter = this.get({ eventEmitter: null }, EventEmitter.prototype);
    eventEmitter.emit('messageEvent', message);
}