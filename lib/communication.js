const http = require("http");
const dns = require("dns");
const utils = require("utils");
const config = require("./package.json");

function Communication({ ishttp, iswebsocket }) {
    this.lock = false;
};

Communication.prototype.send = function({ componentName , headers, data, retryCount = 1 }) {
    return new Promise((resolve) => {
        const { host, port } = config.component;
        const requestUrl = `${host}:${port}/${componentName}`;
        if (typeof data !== "string"){
            request.log(`input data provided for ${requestUrl} is not a string`);
            return reject("data provided is not a string");
        }
        delete headers["content-length"];
        headers["Content-Length"] = Buffer.byteLength(data);
        request.log(`sending request to ${requestUrl}`);
        const req = http.request({ host, port, path:`/${componentName}`, method: "POST", timeout: 30000, headers }, (response) => {
            response.setEncoding('utf8');
            let rawData="";
            response.on('data', (chunk) => {
                rawData += chunk;
            });
            response.on('end',() => {
                logging.write("component.communication",`recieved response from ${requestUrl}`);
                await resolve({ data: rawData, headers: response.headers, statusCode: response.statusCode, statusMessage: response.statusMessage });
            });
        });
        req.on('error', async (error) => {
            logging.write("component.communication", `error sending request retry ${retryCount} of 3`, error);
            retryCount = retryCount + 1;
            if (retryCount <= 3){
                const res = await this.send({ path:`/${componentName}`, headers, data, retryCount });
                await resolve(res);
            } else {
                await resolve({ data: error, headers: req.headers, statusCode: 500, statusMessage: "Connection Error" });
            }
        });
        req.write(data);
        req.end();
    });
};
Communication.prototype.receive = function() {
    return new Promise((resolve) => {
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
                        let { message } = await resolve({
                            host: config.host,
                            port: config.port,
                            path: request.url,
                            headers: request.headers,
                            data: body
                        });
                        let { headers, statusCode, statusMessage, text } = message || {};
                        headers = headers || {};
                        statusCode = statusCode || 500;
                        statusMessage = statusMessage || "Internal Server Error";
                        text = text || "";
                        delete headers["content-length"];
                        headers["Content-Length"] = Buffer.byteLength(text);
                        response.writeHead(statusCode, statusMessage, headers ).end(text);
                        this.lock = false;
                    });
                },1000);
            });
            host.on("error", async (hostError) => {
                if (newHost.host){
                    dns.lookup(requestHandler.config.host, async (dnsErr) => {
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
    });
};