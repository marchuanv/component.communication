const http = require("http");
const dns = require("dns");
const config = require("../package.json");
const logging = require("component.logging");
const utils = require("utils");

function Communication({ ishttp, iswebsocket }) {
    this.lock = false;
    this.ishttp = ishttp;
    this.iswebsocket = iswebsocket;
};

Communication.prototype.send = function({ data, retryCount = 1}) {
    const { component } = data;
    const { headers } = data.message;
    const responseData = utils.getJSONString(data);
    return new Promise((resolve, reject) => {
        const { host, port } = config.component;
        const requestUrl = `${host}:${port}/${component}`;
        delete headers["content-length"];
        headers["Content-Length"] = Buffer.byteLength(responseData);
        logging.write("component.communication", `sending request to ${requestUrl}`);
        const req = http.request({ host, port, path:`/${component}`, method: "POST", timeout: 30000, headers }, (response) => {
            response.setEncoding('utf8');
            let rawData="";
            response.on('data', (chunk) => {
                rawData += chunk;
            });
            response.on('end',async () => {
                logging.write("component.communication",`recieved response from ${requestUrl}`);
                await resolve({ success: true, message: { text: rawData, headers: response.headers, statusCode: response.statusCode, statusMessage: response.statusMessage }} );
            });
        });
        req.on('error', async (error) => {
            logging.write("component.communication", `error sending request retry ${retryCount} of 3`, error);
            retryCount = retryCount + 1;
            if (retryCount <= 3){
                const res = await this.send({ component, message, retryCount });
                await reject(res);
            } else {
                await resolve({ success: false, message: { text: error, headers: req.headers, statusCode: 500, statusMessage: "Connection Error" }});
            }
        });
        req.write(responseData);
        req.end();
    });
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
                    let { message } = await callback({ headers: request.headers, text: body });
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
module.exports = { Communication };