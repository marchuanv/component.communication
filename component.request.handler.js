const http = require("http");
const logging = require("logging");
const utils = require("utils");
const net = require('net')
module.exports = {
    servers: [],
    port: ({ privatePort }) => {
        return new Promise((resolve)=>{
            let server = module.exports.servers.find(s=>s.port === privatePort);
            if (!server){
                const instance = http.createServer();
                server = { port: privatePort, instance, started: false };
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
                server.instance.listen(privatePort);
                server.started = true;
                logging.write("Request Handler", `listening on port ${privatePort}`);
            }
            const count = server.instance.listeners("request").length;
            logging.write("Request Handler",`http request event count: ${count}`);
        });
    }
};