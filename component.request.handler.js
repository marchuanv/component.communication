const http = require("http");
const delegate = require("component.delegate");
const dns = require("dns");
const utils = require("utils");
const logging = require("logging");
logging.config.add("Request Handler");

let lock = undefined;
const listeners = {
    promises: [],
    hosts: []
};

const registerHost = async (newHost) => {
    if (lock){
        setTimeout(async () => {
            await registerHost(newHost);
        },1000);
        return;
    } else {
        lock = true;
        if (listeners.hosts.find(h => h.port === newHost.port && h.port)){
            lock = false;
            return;
        }
        const host = http.createServer();
        if (newHost.host){
            await host.listen({ host: newHost.host, port: newHost.port });
        } else {
            await host.listen({ port: newHost.port });
        }

        host.on("request", (request, response) => {
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
                const requestPort = host.address().port;
                const route = listeners.hosts.find(h => h.port === requestPort);

                if (!route){
                    response.writeHead( 400, "Bad Request").end("400 Bad Request");
                    return;
                }

                let result = await delegate.call( { context: `component.request.handler.route`, wildcard: route.port }, {
                    path: request.url,
                    host: route.host,
                    port: route.port,
                    headers: request.headers,
                    data: body,
                    id: utils.generateGUID()
                });
        
                if (!result){
                    result = {};
                    result.headers = { "content-type": "text/plain" };
                    result.data = "callbacks did not return any results";
                    result.statusCode = 200;
                    result.statusMessage = "Success";
                }
        
                if (result.headers && result.statusMessage && result.statusCode){
                    delete result.headers["Content-Length"];
                    result.data = result.data || "";
                    result.headers["content-length"] = Buffer.byteLength(result.data);
                    response.writeHead( result.statusCode, result.statusMessage, result.headers).end(result.data);
                } else if(result.message && result.stack) {
                    response.writeHead( 500, "Internal Server Error").end( (result && result.message) || "Internal Server Error" );
                }
            });
        });
        host.on("error", (hostError) => {
            dns.lookup(newHost.privateHost, (dnsErr, ipAddress) => {
                if (dnsErr){
                    throw dnsErr;
                }
                if (hostError.message !== `listen EADDRINUSE: address already in use ${ipAddress}:${newHost.port}`){
                    throw hostError;
                }
            });
        });
        listeners.hosts.push(newHost);
        logging.write("Request Handler", `listening on ${newHost.host}:${newHost.port}`);
        lock = false;
    }
};

process.on('SIGTERM', () => {
  console.info('SIGTERM signal received.');
  console.log('Closing http server.');
  host.close(() => {
    console.log('Http server closed.');
  });
});

module.exports = {
    handle: async ({host, port}) => {
        const newHost = { host, port };
        if (!newHost.port){
            const message = "no port specified";
            logging.write("Request Handler", message);
            throw message;
        }
        if (listeners.hosts.find(x => x.port === newHost.port)){
            return;
        }
        await registerHost(newHost);
    }
};