const http = require("http");
const dns = require("dns");
const utils = require("utils");
const component = require("component");
let lock = undefined;

( async () => {
    await component.load({ moduleName: "component.logging", gitUsername: "marchuanv", parentModuleName: "component.request.handler" });
    await component.load({ moduleName: "component.request.handler.route", gitUsername: "marchuanv" });
    const { componentLogging, componentRequestHandlerRoute } = component;
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
                    componentLogging.write("component.request.handler",`received request for ${request.url}`);
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

                    let result = await componentRequestHandlerRoute.delegate.call( { wildcard: newHost.port }, {
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
                            componentLogging.write("component.request.handler", dnsErr);
                            return componentLogging.write("component.request.handler", `error hosting on ${JSON.stringify(newHost)}`);
                        }
                    });
                } else {
                    componentLogging.write("component.request.handler", hostError);
                    return componentLogging.write("component.request.handler", `error hosting on ${JSON.stringify(newHost)}`);
                }
            });
            host.on("listening", () => {
                componentLogging.write("component.request.handler", `listening on ${JSON.stringify(newHost)}`);
            });
            lock = false;
        }
    };
    const package = require("./package.json");
    const newHost = { host: package.hostname, port: package.port };
    registerHost(newHost);
})();

process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    console.log('Closing http server.');
    host.close(() => {
        console.log('Http server closed.');
    });
});