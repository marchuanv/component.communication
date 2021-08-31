const http = require("http");
const dns = require("dns");

const logging = require("component.logging");
logging.register({ componentName: "component.communication" });

const { CommunicationOutgoingMessage } = require("./communication.outgoing.message.js");
const { CommunicationIncomingMessage } = require("./communication.incoming.message.js");
const { CommunicationResponseMessage } = require("./communication.response.message.js");
const CommunicationStatus = require("./communication.status.js");
const CommunicationRequestHandlerCallback = require("./communication.request.handler.callback.js");

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
    this.server = http.createServer();
    this.isStarted = false;
    this.requestCallbacks = [];
    this.requestHandler = async ({ requestCallback, url, requestHeaders, requestBody }) => {
     
        const defaultHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Expose-Headers": "*",
            "Access-Control-Allow-Headers": "*",
            "Content-Type": "text/plain"
        };
        const isPreflight = requestHeaders["access-control-request-headers"] !== undefined;
        if(isPreflight) {
            requestCallback.response.statusCode = 200;
            requestCallback.response.statusMessage = communicationStatus.getStatusMessage(response.statusCode);
            requestCallback.response.headers = defaultHeaders;
        } else {
            const incomingMessage = new CommunicationIncomingMessage({ Id: url.replace("/",""), headers: requestHeaders, body: requestBody });
            let bodyCollate = [];
            let hasSelectedHeaders = false;
            try {
                await incomingMessage.validate();
                let responseMessages = await requestCallback.callback(incomingMessage);
                if (responseMessages) {
                    if (!Array.isArray(responseMessages)) {
                        responseMessages = [responseMessages]; 
                    }
                    for(const responseMessage of responseMessages) {
                        if (responseMessage){
                            if (responseMessage instanceof CommunicationResponseMessage) {
                                await responseMessage.validate();
                                if (communicationStatus.isSuccess(responseMessage.status) && !hasSelectedHeaders) {
                                    if (communicationStatus.getStatusCode(responseMessage.status) === 201) {
                                        requestCallback.response.statusCode = responseMessage.statusCode;
                                        requestCallback.response.statusMessage = responseMessage.statusMessage;
                                        requestCallback.response.headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                    if (communicationStatus.getStatusCode(responseMessage.status) === 200) {
                                        requestCallback.response.statusCode = responseMessage.statusCode;
                                        requestCallback.response.statusMessage = responseMessage.statusMessage;
                                        requestCallback.response.headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                }
                                if (communicationStatus.isFail(responseMessage.status) && !hasSelectedHeaders) {
                                    if (communicationStatus.getStatusCode(responseMessage.status) === 400) {
                                        requestCallback.response.statusCode = responseMessage.statusCode;
                                        requestCallback.response.statusMessage = responseMessage.statusMessage;
                                        requestCallback.response.headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                    if (communicationStatus.getStatusCode(responseMessage.status) === 401) {
                                        requestCallback.response.statusCode = responseMessage.statusCode;
                                        requestCallback.response.statusMessage = responseMessage.statusMessage;
                                        requestCallback.response.headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                    if (communicationStatus.getStatusCode(responseMessage.status) === 500) {
                                        requestCallback.response.statusCode = responseMessage.statusCode;
                                        requestCallback.response.statusMessage = responseMessage.statusMessage;
                                        requestCallback.response.headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                }
                                if (hasSelectedHeaders) {
                                    bodyCollate.push(responseMessage.toString());
                                }
                                requestCallback.response.body = utils.getJSONString(bodyCollate);
                            }
                        }
                    };
                } else {
                    requestCallback.response.statusCode = 500;
                    requestCallback.response.statusMessage = communicationStatus.getStatusMessage(500);
                    requestCallback.response.headers = {};
                    requestCallback.response.body = "no results from one or more callbacks";
                }
            } catch (err) {
                logging.write("component.communication",`error message: ${err.message}, error stack: ${err.stack}`);    
            }
        }
    };
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
Communication.prototype.handle = function({ callback }) {
    if (callback instanceof CommunicationRequestHandlerCallback) {
        return logging.write("component.communication",`unable to handle request on ${this.host}:${this.port}, callback is not of type CommunicationRequestHandlerCallback`);
    }
    this.requestCallbacks.push({ callback, response: {
        statusCode: 500,
        statusMessage: communicationStatus.getStatusMessage(500),
        headers: {},
        body: communicationStatus.getStatusMessage(500)
    }});
};
Communication.prototype.start = async function() {
    if (this.isStarted) {
        return logging.write("component.communication",`already listening on ${this.host}:${this.port}`);
    }
    this.server.listen(this);
    this.server.on("error", async (hostError) => {
        if (this.host){
            dns.lookup(this.host, async (dnsErr) => {
                if (dnsErr){
                    return await logging.write("component.communication", `error hosting on ${this.host}:${this.port}, error: ${dnsErr.message}`);
                }
            });
        } else {
            return await logging.write("component.communication", `error hosting on ${this.host}:${this.port}, error: ${hostError.message}`);
        }
    });
    this.server.on("request", (request, response) => {
        setTimeout(() => {
            let body = '';
            request.on('data', chunk => {
                body += chunk.toString();
            });
            request.on('end', async () => {
                for(const requestCallback of this.requestCallbacks) {
                    await this.requestHandler({ requestCallback, url: request.url, requestHeaders: request.headers, requestBody: body });
                };
                const successfull = this.requestCallbacks.find(x => x.response.statusCode === 200 || x.response.statusCode === 201);
                const notFound = this.requestCallbacks.find(x => x.response.statusCode === 400);
                const unauthorised = this.requestCallbacks.find(x => x.response.statusCode === 401);
                const internalServerError = this.requestCallbacks.find(x => x.response.statusCode === 500);
                const callbackResponse = successfull || unauthorised || notFound || internalServerError;
                return response.writeHead(
                    callbackResponse.response.statusCode,
                    callbackResponse.response.statusMessage,
                    callbackResponse.response.headers
                ).end(callbackResponse.response.body);
            });
        }, 100);
    });
    this.server.on("listening", async () => {
        await logging.write("component.communication",`server is listening on ${this.host}:${this.port}`);
        this.isStarted = true;
        this.receive((message) => {
            if (message.isForResource()) {
                
            }
        });
    });
};
module.exports = { 
    CommunicationIncomingMessage,
    CommunicationOutgoingMessage,
    CommunicationResponseMessage,
    Communication,
    CommunicationStatus,
    CommunicationRequestHandlerCallback
};