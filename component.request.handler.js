const http = require("http");
const dns = require("dns");
const utils = require("utils");
const component = require("component");
const delegate = require("component.delegate");
let logging;
component.require("component.logging", { gitUsername: "marchuanv" } ).then((_logging)=>{
    logging = _logging;
});

let lock = undefined;

const registerHost = async (newHost) => {
    if (lock){
        setTimeout(async () => {
            await registerHost(newHost);
        },1000);
        return;
    } else {
        lock = true;
       
        const host = http.createServer();
        host.listen(newHost);
        
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

                let result = await delegate.call( { context: `component.request.handler.route`, wildcard: newHost.port }, {
                    path: request.url,
                    host: newHost.host,
                    port: newHost.port,
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
            if (newHost.host){
                dns.lookup(newHost.host, (dnsErr) => {
                    if (dnsErr){
                        logging.write("Request Handler", dnsErr);
                        return logging.write("Request Handler", `error hosting on ${JSON.stringify(newHost)}`);
                    }
                });
            } else {
                logging.write("Request Handler", hostError);
                return logging.write("Request Handler", `error hosting on ${JSON.stringify(newHost)}`);
            }
        });
        host.on("listening", () => {
            logging.write("Request Handler", `listening on ${JSON.stringify(newHost)}`);
        });
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
        if (newHost.host){
            newHost.host = newHost.host.replace(/\s/g, '');
        }
        newHost.port = Number(newHost.port);
        await registerHost(newHost);
    }
};