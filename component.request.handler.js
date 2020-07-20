const http = require("http");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("Request Handler");
module.exports = {
    handle: (options) => {
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
                if(isPreflight){
                    return response.writeHead( 200, "Success", defaultHeaders ).end("");
                }
                let results = await delegate.call("component.request.handler.route", { 
                    path: request.url, 
                    headers: request.headers, 
                    data: body, 
                    privatePort: options.privateHost, 
                    privatePort: options.privatePort
                });
                if (results.headers){
                    delete results.headers["Content-Length"];
                    results.headers["content-length"] = Buffer.byteLength(results.data || "");
                }
                if (results.error){
                    response.writeHead( 500, "Internal Server Error").end();
                } else {
                    response.writeHead( results.statusCode, results.statusMessage, results.headers).end(results.data);
                }
            });
        });
        if (options.privateHost){
            host.listen({ host: options.privateHost, port: options.privatePort });
            logging.write("Request Handler", `listening on ${options.privateHost}:${options.privatePort}`);
        } else {
            host.listen({ port: options.privatePort });
            logging.write("Request Handler", `listening on port ${options.privatePort}`);
        }
    }
};