const http = require("http");
const delegate = require("component.delegate");
const logging = require("logging");
logging.config.add("Request Handler");

module.exports = { handle: ({ callingModuleName, port }) => {
    const server = http.createServer();
    server.on("request", (request, response)=>{
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
            try {
                let results = delegate.call(callingModuleName, {  path: request.url, headers: request.headers, data: body });
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
        });
    });
    server.listen(port);
}};