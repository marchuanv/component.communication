const http = require("http");
const dns = require("dns");

const { Logger } = require("component.logging");
const logging = new Logger({ componentName: "Communication Connection" });

const { RequestMessage } = require("./requestmessage.js");
const { ResponseMessage } = require("./responsemessage.js");
const { MessageStatus } = require("./messagestatus.js");
const { RequestHandler } = require("./requesthandler.js");

const utils = require("utils");
const messageStatus = new MessageStatus();

function Connection({ host, port, ishttp, iswebsocket }) {
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
    this.requestHandlers = [];
};

Connection.prototype.send = function(message) {
    if (message instanceof RequestMessage) {
        let { Id, headers, retryCount } = message;
        return new Promise(async (resolve) => {
            await message.validate();
            const { host, port } = this;
            const requestUrl = `${host}:${port}/${Id}`;
            delete headers["content-length"];
            headers["Content-Length"] = Buffer.byteLength(message.toString());
            logging.write(`sending request to ${requestUrl}`);
            const req = http.request({ host, port, path:`/${Id}`, method: "POST", timeout: 30000, headers }, (response) => {
                response.setEncoding('utf8');
                let rawData="";
                response.on('data', (chunk) => {
                    rawData += chunk;
                });
                response.on('end',async () => {
                    logging.write(`recieved response from ${requestUrl}`);
                    const responseMessage = new ResponseMessage({ 
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
                logging.write(`error sending request retry ${retryCount} of 3`, error);
                if (message.retryCount < 4){
                    message.retryCount = message.retryCount + 1;
                    await resolve(await this.send(message));
                } else {
                    const responseMessage = new ResponseMessage({
                        Id: message.Id,
                        headers,
                        body: error,
                        status: messageStatus.getStatus(500)
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
Connection.prototype.handle = function(requestHandler) {
    if (requestHandler instanceof RequestHandler) {
        this.requestHandlers.push(requestHandler);
    } else {
        return logging.write(`unable to handle request on ${this.host}:${this.port}, callback is not of type RequestHandler`);
    }
};
Connection.prototype.start = async function() {
    if (this.isStarted) {
        return logging.write(`already listening on ${this.host}:${this.port}`);
    }
    this.server.on("error", async (hostError) => {
        if (this.host){
            dns.lookup(this.host, async (dnsErr) => {
                if (dnsErr){
                    return await logging.write(`error hosting on ${this.host}:${this.port}, error: ${dnsErr.message}`);
                }
            });
        } else {
            return await logging.write(`error hosting on ${this.host}:${this.port}, error: ${hostError.message}`);
        }
    });
    this.server.on("request", (request, response) => {
        setTimeout(() => {
            let body = '';
            request.on('data', chunk => {
                body += chunk.toString();
            });
            request.on('end', async () => {
                for(const requestHandler of this.requestHandlers) {
                    await requestHandler.handle({ url: request.url, requestHeaders: request.headers, requestBody: body });
                };
                const successfull = this.requestHandlers.find(x => x.response.statusCode === 200 || x.response.statusCode === 201);
                const notFound = this.requestHandlers.find(x => x.response.statusCode === 400);
                const unauthorised = this.requestHandlers.find(x => x.response.statusCode === 401);
                const internalServerError = this.requestHandlers.find(x => x.response.statusCode === 500);
                const callbackResponse = unauthorised || successfull || notFound || internalServerError;
                return response.writeHead(
                    callbackResponse.response.statusCode,
                    callbackResponse.response.statusMessage,
                    callbackResponse.response.headers
                ).end(callbackResponse.response.body);
            });
        }, 100);
    });
    this.server.on("listening", async () => {
        await logging.write(`server is listening on ${this.host}:${this.port}`);
        this.isStarted = true;
    });
    const optionsStr = utils.getJSONString(this);
    const options = utils.getJSONObject(optionsStr);
    this.server.listen(options);
};
module.exports = { Connection };