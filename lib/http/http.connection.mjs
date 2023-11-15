import {
    ConnectionOptions,
    ContentType,
    Properties,
    createServer,
    request
} from '../registry.mjs';
const contentType = new ContentType('json');
export class HttpConnection extends Properties {
    /**
     * @param { ConnectionOptions } connectionOptions
    */
    constructor(connectionOptions) {
        super();
        super.set('connectionOptions', connectionOptions);
        const server = createServer();
        super.set('server', server);
        super.set('retryCount', 0);
        Object.freeze(this);
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
                        return reject(new Error(
                            'message argument does not match template: { headers: Object, body: { Id: String, data: String } }'
                        ));
                    }
                    await resolve({ Id, data });
                });
            });
            req.on('error', async (error) => {
                console.error(error);
                let retryCount = super.get('retryCount');
                console.error(`error sending request, re-trying: ${retryCount} of ${maxRetryCount}`);
                if (retryCount <= maxRetryCount) {
                    retryCount = retryCount + 1;
                    super.set('retryCount', retryCount);
                    await resolve((await this.send(message)));
                } else {
                    await reject(new Error(`exceed max retry: ${maxRetryCount}`));
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
            const server = super.get('server');
            const connectionOptions = this.get('connectionOptions');
            const { host, port } = connectionOptions;
            server.on("error", async (hostError) => {
                if (host) {
                    dns.lookup(host, async (dnsErr) => {
                        if (dnsErr) {
                            throw new Error(`error hosting on ${host}:${port}, error: ${dnsErr.message}`);
                        }
                    });
                }
                console.error(hostError);
                reject(hostError);
            });
            server.on("request", (request, response) => {
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
            server.on("listening", resolve);
            server.listen(connectionOptions);
        });
    }
}
