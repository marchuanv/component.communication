const http = require("http");
const dns = require("dns");

const logging = require("component.logging");
logging.register({ componentName: "component.communication" });

const { CommunicationOutgoingMessage } = require("./communication.outgoing.message.js");
const { CommunicationIncomingMessage } = require("./communication.incoming.message.js");
const { CommunicationResponseMessage } = require("./communication.response.message.js");
const CommunicationStatus = require("./communication.status.js");
const utils = require("utils");
const communicationStatus = new CommunicationStatus();

function Communication({ host, port, ishttp, iswebsocket }) {
    if (!host || !port) {
        throw new Error("host and port is required");
    }
    this.lock = false;
    this.ishttp = ishttp;
    this.iswebsocket = iswebsocket;
    this.port = port;
    this.host = host;
};

Communication.prototype.send = function(message) {
    if (message instanceof CommunicationOutgoingMessage) {
        let { Id, headers, retryCount } = message;
        return new Promise(async (resolve) => {
            await message.validate();
            const { host, port } = this;
            const requestUrl = `${host}:${port}/${Id}`;
            delete headers["content-length"];
            headers["Content-Length"] = Buffer.byteLength(message.toString());
            logging.write("component.communication", `sending request to ${requestUrl}`);
            const req = http.request({ host, port, path:`/${Id}`, method: "POST", timeout: 30000, headers }, (response) => {
                response.setEncoding('utf8');
                let rawData="";
                response.on('data', (chunk) => {
                    rawData += chunk;
                });
                response.on('end',async () => {
                    logging.write("component.communication",`recieved response from ${requestUrl}`);
                    const responseMessage = new CommunicationResponseMessage({ 
                        Id: message.Id,
                        headers: response.headers,
                        body: rawData,
                        statusCode: response.statusCode,
                        statusMessage: response.statusMessage
                    });
                    await responseMessage.validate();
                    await resolve(responseMessage);
                });
            });
            req.on('error', async (error) => {
                logging.write("component.communication", `error sending request retry ${retryCount} of 3`, error);
                if (message.retryCount < 4){
                    message.retryCount = message.retryCount + 1;
                    await resolve(await this.send(message));
                } else {
                    const responseMessage = new CommunicationResponseMessage({
                        Id: message.Id,
                        headers,
                        body: error,
                        status: communicationStatus.getStatus(500)
                    });
                    await responseMessage.validate();
                    await resolve(responseMessage);
                }
            });
            req.write(message.toString());
            req.end();
        });
    } else {
        throw new Error("message parameter is not of type: CommunicationOutgoingMessage");
    }
};
Communication.prototype.receive = function(callback) {
    if (this.lock){
        setTimeout(async () => {
            resolve(await this.receive());
        },1000);
        return;
    } else {
        this.lock = true;
    
        const host = http.createServer();
        host.listen(this);
        
        host.on("request", (request, response) => {
            const id = setInterval( async () => {
                if (this.lock){
                    return;
                }
                this.lock = true;
                clearInterval(id);
                let body = '';
                request.on('data', chunk => {
                    body += chunk.toString();
                });
                request.on('end', async () => {
                    const defaultHeaders = {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Expose-Headers": "*",
                        "Access-Control-Allow-Headers": "*",
                        "Content-Type": "text/plain"
                    };
                    const isPreflight = request.headers["access-control-request-headers"] !== undefined;
                    if(isPreflight) {
                        this.lock = false;
                        return response.writeHead( 200, "Success", defaultHeaders ).end("");
                    }
                    const incomingMessage = new CommunicationIncomingMessage({ Id: request.url.replace("/",""), headers: request.headers, body });
                    await incomingMessage.validate();
                    

                    let responseMessages = await callback(incomingMessage);
                    if (!Array.isArray(responseMessages)) {
                        responseMessages = [responseMessages]; 
                    }

                    let statusCode = 500;
                    let statusMessage = communicationStatus.getStatusMessage(500);
                    let headers = {};
                    let body = [];
                    let hasSelectedHeaders = false;

                    for(const responseMessage of responseMessages) {
                        if (responseMessage instanceof CommunicationResponseMessage) {
                            try{
                                await responseMessage.validate();
                                if (communicationStatus.isSuccess(responseMessage.status) && !hasSelectedHeaders) {
                                    if (communicationStatus.getStatusCode(responseMessage.status) === 201) {
                                        statusCode = responseMessage.statusCode;
                                        statusMessage = responseMessage.statusMessage;
                                        headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                    if (communicationStatus.getStatusCode(responseMessage.status) === 200) {
                                        statusCode = responseMessage.statusCode;
                                        statusMessage = responseMessage.statusMessage;
                                        headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                }
                                if (communicationStatus.isFail(responseMessage.status) && !hasSelectedHeaders) {
                                    if (communicationStatus.getStatusCode(responseMessage.status) === 400) {
                                        statusCode = responseMessage.statusCode;
                                        statusMessage = responseMessage.statusMessage;
                                        headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                    if (communicationStatus.getStatusCode(responseMessage.status) === 401) {
                                        statusCode = responseMessage.statusCode;
                                        statusMessage = responseMessage.statusMessage;
                                        headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                    if (communicationStatus.getStatusCode(responseMessage.status) === 500) {
                                        statusCode = responseMessage.statusCode;
                                        statusMessage = responseMessage.statusMessage;
                                        headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                }
                                if (hasSelectedHeaders) {
                                    body.push(responseMessage.toString());
                                }
                            } catch {}
                        }
                    }
                    logging.write("component.communication",`sending response to ${request.url}`);
                    response.writeHead(statusCode, statusMessage, headers).end(utils.getJSONString(body));
                    this.lock = false;
                });
            },1000);
        });
        host.on("error", async (hostError) => {
            if (newHost.host){
                dns.lookup(this.host, async (dnsErr) => {
                    if (dnsErr){
                        return logging.write("component.communication", `error hosting on ${this.host}:${this.port}, error: ${dnsErr.message}`);
                    }
                });
            } else {
                return logging.write("component.communication", `error hosting on ${this.host}:${this.port}, error: ${hostError.message}`);
            }
        });
        host.on("listening", async () => {
            await logging.write("component.communication",`listening on ${this.host}:${this.port}`);
        });
        this.lock = false;
    }
};
module.exports = { CommunicationIncomingMessage, CommunicationOutgoingMessage, CommunicationResponseMessage, Communication, CommunicationStatus };