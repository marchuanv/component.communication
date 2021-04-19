const http = require("http");
const dns = require("dns");
const config = require("../package.json");
const logging = require("component.logging");
const utils = require("utils");
const { CommunicationMessage } = require("./communication.message.js");

function Communication({ ishttp, iswebsocket }) {
    this.lock = false;
    this.ishttp = ishttp;
    this.iswebsocket = iswebsocket;
};

Communication.prototype.send = function(message) {
    if (message instanceof CommunicationMessage) {
        message.validate();
        let { body, headers, retryCount } = message;
        const { component } = body;
        return new Promise((resolve, reject) => {
            const { host, port } = config.component;
            const requestUrl = `${host}:${port}/${component}`;
            delete headers["content-length"];
            headers["Content-Length"] = Buffer.byteLength(message.toString());
            logging.write("component.communication", `sending request to ${requestUrl}`);
            const req = http.request({ host, port, path:`/${component}`, method: "POST", timeout: 30000, headers }, (response) => {
                response.setEncoding('utf8');
                let rawData="";
                response.on('data', (chunk) => {
                    rawData += chunk;
                });
                response.on('end',async () => {
                    logging.write("component.communication",`recieved response from ${requestUrl}`);
                    const incomingMessage = new CommunicationMessage({
                        Id: message.Id,
                        headers: response.headers,
                        body: rawData,
                        statusCode: response.statusCode,
                        statusMessage: response.statusMessage
                    });
                    incomingMessage.validate();
                    await resolve(incomingMessage);
                });
            });
            req.on('error', async (error) => {
                logging.write("component.communication", `error sending request retry ${retryCount} of 3`, error);
                retryCount = retryCount + 1;
                if (retryCount <= 3){
                    const res = await this.send({ data, retryCount });
                    await resolve(res);
                } else {
                    const errorMessage = new CommunicationMessage({
                        Id: message.Id,
                        headers: req.headers,
                        body: error,
                        statusCode: 500,
                        statusMessage: "Connection Error"
                    });
                    errorMessage.validate();
                    await reject(errorMessage);
                }
            });
            req.write(message.toString());
            req.end();
        });
    } else {
        throw new Error("message parameter is not of type: CommunicationMessage");
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
        host.listen(config.component);
        
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
                    const incomingMessage = new CommunicationMessage({ Id: request.path.replace("/",""), headers: request.headers, body: request.body, statusCode: 200, statusMessage: "Success"});
                    incomingMessage.validate();
                    const outgoingMessage = new CommunicationMessage(await callback(incomingMessage));
                    outgoingMessage.validate();
                    data.message.headers["Content-Length"] = Buffer.byteLength(outgoingMessage.toString());
                    response.writeHead(outgoingMessage.statusCode, outgoingMessage.statusMessage, outgoingMessage.headers ).end(outgoingMessage.toString());
                    this.lock = false;
                });
            },1000);
        });
        host.on("error", async (hostError) => {
            if (newHost.host){
                dns.lookup(config.host, async (dnsErr) => {
                    if (dnsErr){
                        return logging.write("component.communication", `error hosting on ${config.host}:${config.port}, error: ${dnsErr.message}`);
                    }
                });
            } else {
                return logging.write("component.communication", `error hosting on ${config.host}:${config.port}, error: ${hostError.message}`);
            }
        });
        host.on("listening", async () => {
            await logging.write("component.communication",`listening on ${config.host}:${config.port}`);
        });
        this.lock = false;
    }
};
module.exports = { CommunicationMessage, Communication };