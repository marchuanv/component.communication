const http = require("http");
const logging = require("logging");
logging.config([ "Request Handler" ]);
module.exports = {
    servers: [],
    port: ({ port }) => {
        return new Promise((resolve)=>{
            let server = module.exports.servers.find(s=>s.port === port);
            if (!server){
                const instance = http.createServer();
                server = { port, instance, started: false };
                module.exports.servers.push(server);
            }
            server.instance.removeAllListeners("request");
            server.instance.on("request", (request, response)=>{
                let body = '';
                request.on('data', chunk => {
                    body += chunk.toString();
                });
                request.on('end', () => {
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

                    resolve({ handle: async (callback) => {
                        try {
                            let results = callback({  path: request.url, headers: request.headers, data: body });
                            if (results && results.then){
                                results = await results.catch((error)=>{
                                    logging.write("Request Handler"," ", error.toString());
                                    response.writeHead( 500, "Internal Server Error").end();
                                });
                            }
                            response.writeHead( results.statusCode, results.statusMessage, results.headers).end(results.data);
                        } catch {
                            response.writeHead( 500, "Internal Server Error").end();
                        }
                    }});
                });
            });
            if (server.started===false){
                server.instance.listen(port);
                server.started = true;
                logging.write("Request Handler", `listening on port ${port}`);
            }
            const count = server.instance.listeners("request").length;
            logging.write("Request Handler",`http request event count: ${count}`);
        });
    }
};