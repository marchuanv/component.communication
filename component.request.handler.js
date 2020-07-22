const http = require("http");
const delegate = require("component.delegate");
const dns = require("dns");
const logging = require("logging");
logging.config.add("Request Handler");

module.exports = {
    handle: async (options) => {
        const host = http.createServer();
        host.on("request", (request, response)=>{
            let body = '';
            request.on('data', chunk => {
                body += chunk.toString();
            });
            request.on('end', async () => {
                logging.write("Request Handler",`received request for ${request.url}`);
                const defaultHeaders = {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Expose-Headers": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Content-Type": "text/plain"
                };
                const isPreflight = request.headers["access-control-request-headers"] !== undefined;
                if(isPreflight) {
                    return response.writeHead( 200, "Success", defaultHeaders ).end("");
                }
                let result = await delegate.call( { context: "component.request.handler.route" }, {
                    path: request.url,
                    headers: request.headers,
                    data: body,
                    publicHost: options.publicHost,
                    publicPort: options.publicPort
                });
                if (result && result.headers && result.statusMessage && result.statusCode){
                    delete result.headers["Content-Length"];
                    result.data = result.data || "";
                    result.headers["content-length"] = Buffer.byteLength(result.data);
                    response.writeHead( result.statusCode, result.statusMessage, result.headers).end(result.data);
                } else {
                    response.writeHead( 500, "Internal Server Error").end(result.message);
                }
            });
        });
        host.on("error", (hostError) => {
            dns.lookup(options.privateHost, (dnsErr, ipAddress) => {
                if (dnsErr){
                    throw dnsErr;
                }
                if (hostError.message !== `listen EADDRINUSE: address already in use ${ipAddress}:${options.privatePort}`){
                    throw hostError;
                }
            });
        });
        host.on("listening", () => {
            logging.write("Request Handler", `listening on ${options.privateHost}:${options.privatePort}`);
        });
        if (options.privateHost){
            await host.listen({ host: options.privateHost, port: options.privatePort });
        } else {
            await host.listen({ port: options.privatePort });
        }
    }
};


