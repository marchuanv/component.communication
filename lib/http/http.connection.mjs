import {
    ConnectionOptions,
    ContentType,
    createServer,
    request
} from '../registry.mjs';
const contentType = new ContentType('json');
export class HttpConnection {
    /**
     * @param { ConnectionOptions } connectionOptions
    */
    constructor(connectionOptions) {
        this._connectionOptions = connectionOptions;
        this._server = createServer();
        this._retryCountMax = connectionOptions.maxRetryCount;
        this._timeOut = connectionOptions.timeoutMilli;
        Object.freeze(this);
    }
    /**
     * @param { { headers: Object, body: { Id: String, data: String } } } message
     * @returns {{ Id: String, data: String }}
    */
    send(message) {
        let _retryCount;
        const { headers, body } = message || {};
        const { Id, data } = body || {};
        if (!headers || !body || !Id || !data) {
            throw new Error(`message argument does not match template: { headers: Object, body: { Id: String, data: String } }`);
        }
        const dataToSend = JSON.stringify({ Id, data });
        const { _timeOut, _retryCountMax, _connectionOptions } = this;
        const { remoteHost, remotePort } = _connectionOptions;
        return new Promise(async (resolve, reject) => {
            const requestUrl = `${remoteHost}:${remotePort}/${Id}`;
            delete headers["content-length"];
            headers["Content-Length"] = Buffer.byteLength(dataToSend);
            console.log(`sending request to ${requestUrl}`);
            const req = request({
                host: remoteHost,
                port: remotePort,
                path: `/${Id}`,
                method: "POST",
                timeout: _timeOut,
                headers
            }, (response) => {
                let body = '';
                response.on('data', chunk => body = body + chunk);
                response.on('end', async () => {
                    console.log(`recieved response from ${requestUrl}`);
                    const message = JSON.parse(body);
                    const { Id, data } = message || {};
                    if (!Id || !data) {
                        return reject(new Error(
                            'message argument does not match template: { headers: Object, body: { Id: String, data: String } }'
                        ));
                    }
                    await resolve({ Id, data });
                });
            });
            req.on('error', async (error) => {
                console.error(error);
                console.error(`error sending request, re-trying: ${_retryCount} of ${_retryCountMax}`);
                if (_retryCount <= _retryCountMax) {
                    _retryCount = _retryCount + 1;
                    await resolve((await this.send(message)));
                } else {
                    await reject(new Error(`exceed max retry: ${_retryCountMax}`));
                }
            });
            req.write(dataToSend);
            req.end();
        });
    }
    /**
     * @returns { Promise }
    */
    open() {
        return new Promise((resolve, reject) => {
            this._server.on("error", async (hostError) => {
                if (this._hostName) {
                    dns.lookup(this._hostName, async (dnsErr) => {
                        if (dnsErr) {
                            throw new Error(`error hosting on ${this._hostName}:${this._hostPort}, error: ${dnsErr.message}`);
                        }
                    });
                }
                console.error(hostError);
                reject(hostError);
            });
            this._server.on("request", (request, response) => {
                let body = '';
                request.on('error', (error) => this.error = error);
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
                });
            });
            this._server.on("listening", resolve);
            this._server.listen(this._connectionOptions);
        });
    }
}
