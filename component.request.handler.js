const http = require("http");
const dns = require("dns");
const utils = require("utils");
const component = require("component");

component.load(module).then(async ({ requestHandler }) => {
    const registerHost = async () => {
        if (requestHandler.lock){
            setTimeout(async () => {
                await registerHost();
            },1000);
            return;
        } else {
            requestHandler.lock = true;
        
            const host = http.createServer();
            host.listen(requestHandler.config);
            
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
                        await requestHandler.log(`received request for ${request.url}`);
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
                        let result = await requestHandler.publish({
                            host: requestHandler.config.host,
                            port: requestHandler.config.port,
                            path: request.url,
                            headers: request.headers,
                            requestId: utils.generateGUID(),
                            data: body
                        });
                        if (Array.isArray(result)){
                            response.writeHead( 500, "Internal Server Error").end("more than one response returned.");
                        } else {
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
                                response.writeHead( 500, "Internal Server Error").end(result.message);
                            }
                        }
                        requestHandler.lock = false;
                    });
                },1000);
            });
            host.on("error", async (hostError) => {
                if (newHost.host){
                    dns.lookup(requestHandler.config.host, async (dnsErr) => {
                        if (dnsErr){
                            await requestHandler.log(dnsErr);
                            return await equestHandler.log(`error hosting on ${requestHandler.config.host}:${requestHandler.config.port}`);
                        }
                    });
                } else {
                    await requestHandler.log(hostError);
                    return await requestHandler.log(`error hosting on ${requestHandler.config.host}:${requestHandler.config.port}`);
                }
            });
            host.on("listening", async () => {
                await requestHandler.log(`listening on ${requestHandler.config.host}:${requestHandler.config.port}`);
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