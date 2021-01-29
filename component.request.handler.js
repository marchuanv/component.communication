const http = require("http");
const delegate = require("component.delegate");
const dns = require("dns");
const logging = require("logging");
logging.config.add("Request Handler");
const utils = require("Utils");


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
        if (listeners.hosts.find(h => 
            h.privatePort === newHost.privatePort &&
            h.publicPort === newHost.publicPort &&
            h.publicHost === newHost.publicHost &&
            h.privateHost === newHost.privateHost
        )){
            lock = false;
            return;
        }
        const host = http.createServer();
        if (newHost.privateHost){
            await host.listen({ host: newHost.privateHost, port: newHost.privatePort });
        } else {
            await host.listen({ port: newHost.privatePort });
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
                const portMapping = listeners.hosts.find(host => host.publicPort === requestPort);
                let result = await delegate.call( { context: `component.request.handler.route`, name: portMapping.privatePort }, {
                    path: request.url,
                    headers: request.headers,
                    data: body,
                    publicHost: portMapping.publicHost,
                    publicPort: portMapping.publicPort
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
                if (hostError.message !== `listen EADDRINUSE: address already in use ${ipAddress}:${newHost.privatePort}`){
                    throw hostError;
                }
            });
        });
        listeners.hosts.push(newHost);
        logging.write("Request Handler", `listening on ${newHost.privateHost}:${newHost.privatePort}`);
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
    handle: async (options) => {
        const newHost = {
            privateHost: options.privateHost,
            publicHost: options.publicHost,
            privatePort: options.privatePort,
            publicPort: options.publicPort,
        };
        if (!newHost.privatePort){
            const message = "no private port specified";
            logging.write("Request Handler", message);
            throw message;
        }
        if (listeners.hosts.find(x => x.privatePort === newHost.privatePort)){
            return;
        }
        await registerHost(newHost);
    }
};