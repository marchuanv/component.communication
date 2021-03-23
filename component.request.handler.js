const http = require("http");
const dns = require("dns");
const utils = require("utils");
const component = require("component");
component.register({ componentPackagePath: `${__dirname}/package.json` }).then( async ({ requestHandler }) => {
    const registerHost = async () => {
        if (requestHandler.lock){
            setTimeout(async () => {
                await registerHost();
            },1000);
            return;
        } else {
            requestHandler.lock = true;
        
            const host = http.createServer();
            host.listen(requestHandler);
            
            host.on("request", (request, response) => {
                const id = setInterval( async () => {
                    if (requestHandler.lock){
                        return;
                    }
                    requestHandler.lock = true;
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
                            requestHandler.lock = false;
                            return response.writeHead( 200, "Success", defaultHeaders ).end("");
                        }
                        let result = await requestHandler.publish( { wildcard: requestHandler.port }, {
                            path: request.url,
                            host: requestHandler.host,
                            port: requestHandler.port,
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
                        requestHandler.lock = false;
                    });
                },1000);
            });
            host.on("error", (hostError) => {
                if (newHost.host){
                    dns.lookup(requestHandler.host, (dnsErr) => {
                        if (dnsErr){
                            requestHandler.log(dnsErr);
                            return requestHandler.log(`error hosting on ${requestHandler.host}:${requestHandler.port}`);
                        }
                    });
                } else {
                    requestHandler.log(hostError);
                    return requestHandler.log(`error hosting on ${requestHandler.host}:${requestHandler.port}`);
                }
            });
            host.on("listening", () => {
                requestHandler.log(`listening on ${requestHandler.host}:${requestHandler.port}`);
            });
            requestHandler.lock = false;
        }
    };
    await registerHost();
});

process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    console.log('Closing http server.');
    host.close(() => {
        console.log('Http server closed.');
    });
});