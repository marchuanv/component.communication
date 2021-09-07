const http = require("http");
const dns = require("dns");
const { Logger } = require("component.logging");
const { HttpRequestMessage } = require("./httprequestmessage.js");
const { HttpRequestHandler } = require("./httprequesthandler.js");
const { HttpMessageFactory } = require("./httpmessagefactory.js");

const logging = new Logger({ componentName: "Communication Http Connection" });

function HttpConnection({ host, port }) {
    this.host = host;
    this.port = port;
    this.server = http.createServer();
    this.httpMessageFactory = new HttpMessageFactory();
    this.requestHandlers = [new HttpRequestHandler({ name: "default", callback: () => {
        return this.httpMessageFactory.createResponseMessage({ 
            name: "default",
            content: "Bad Request",
            contentType: "application/json",
            statusCode: 400,
            statusMessage: "Bad Request"
        });
    }})];
}
HttpConnection.prototype.isOpen = function() {

}
HttpConnection.prototype.send = async function(message) {
    if (message instanceof HttpRequestMessage) {
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
HttpConnection.prototype.start = function() {
    return new Promise((resolve) => {
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
                    const resourceName = request.url.replace(/\W/g, '');
                    const requestHandler = this.requestHandlers.find(x => x.name === resourceName) || this.requestHandlers.find(x => x.name === "default");
                    const response = await requestHandler.handle({ requestHeaders: request.headers, requestBody: body });
                    return response.writeHead(
                        response.statusCode,
                        response.statusMessage,
                        response.headers
                    ).end(response.body);
                });
            }, 100);
        });
        this.server.on("listening", async () => {
            resolve();
        });
        const optionsStr = utils.getJSONString(this);
        const options = utils.getJSONObject(optionsStr);
        this.server.listen(options);
    });
}
module.exports = { HttpConnection };