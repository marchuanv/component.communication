const http = require("http");
const dns = require("dns");
const utils = require("utils");
const component = require("component");
component.register({ componentPackagePath: `${__dirname}/package.json` }).then(({ requestHandler }) => {
    const registerHost = async (newHost) => {
        if (newHost.lock){
            setTimeout(async () => {
                await registerHost(newHost);
            },1000);
            return;
        } else {
            newHost.lock = true;
        
            const host = http.createServer();
            host.listen(newHost);
            
            host.on("request", (request, response) => {
                const id = setInterval( async () => {
                    if (newHost.lock){
                        return;
                    }
                    newHost.lock = true;
                    clearInterval(id);

                    let body = '';
                    request.on('data', chunk => {
                        body += chunk.toString();
                    });
                    request.on('end', async () => {
                        requestHandler.log(`received request for ${request.url}`);
                        const defaultHeaders = {
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Expose-Headers": "*",
                            "Access-Control-Allow-Headers": "*",
                            "Content-Type": "text/plain"
                        };
                        const isPreflight = request.headers["access-control-request-headers"] !== undefined;
                        if(isPreflight) {
                            newHost.lock = false;
                            return response.writeHead( 200, "Success", defaultHeaders ).end("");
                        }
                        let result = await requestHandler.publish( { wildcard: newHost.port }, {
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
                        newHost.lock = false;
                    });
                },1000);
            });
            host.on("error", (hostError) => {
                if (newHost.host){
                    dns.lookup(newHost.host, (dnsErr) => {
                        if (dnsErr){
                            requestHandler.log(dnsErr);
                            return requestHandler.log(`error hosting on ${JSON.stringify(newHost)}`);
                        }
                    });
                } else {
                    requestHandler.log(hostError);
                    return requestHandler.log(`error hosting on ${JSON.stringify(newHost)}`);
                }
            });
            host.on("listening", () => {
                requestHandler.log(`listening on ${JSON.stringify(newHost)}`);
            });
            newHost.lock = false;
        }
    };
    const package = require("./package.json");
    registerHost({ host: package.hostname, port: package.port, lock: false });
});

process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    console.log('Closing http server.');
    host.close(() => {
        console.log('Http server closed.');
    });
});