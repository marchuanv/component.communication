const http = require("http");
const logging = require("logging");
const utils = require("utils");
const componentRequestHandlerSecure = require("component.request.handler.secure");
module.exports = { 
    callback: async ({ host, port, path, headers, data })=>{

       return await componentRequestHandlerSecure.callback({ host, port, path, requestHeaders: headers, requestData: data });

        // callback: ({data, fromhost, fromport }) => {
        //     return new Promise(async (resolve) => {
        //         let tryCount = 0;
        //         const id = setInterval(() => {
        //             tryCount = tryCount + 1;
        //             const results = await requestHandlers.getResults()
        //             if (){
        //                 clearInterval(id);
        //                 results.statusCode = 200;
        //                 resolve(results);
        //             } else if (tryCount === 3) {
        //                 clearInterval(id);
        //                 logging.write("Server Request",`deferring ${requestUrl} request`);
        //                 resolve({ data: "Request Deferred", contentType: "text/plain", statusCode: 202 });
        //                 await requestHandlers.defer({ publicHost, publicPort, privateHost, privatePort, path: request.url }, { data, fromhost, fromport });
        //             }
        //         }, 1000);
                
        //     });
        // }
    }, 
    register: ({ publicHost, publicPort, privatePort, path, security, callback })=>{}
};


// const requestListener = async ({ privatePort }) => {
//     const http = require('http');
//     const httpServer = http.createServer();
//     httpServer.on("request", (request, response)=>{
//         let body = '';
//         request.on('data', chunk => {
//             body += chunk.toString();
//         });
//         request.on('end', async () => {
//             let res = { headers: {} };
//             const host = request.headers["host"].split(":")[0];
//             const port = Number(request.headers["host"].split(":")[1]) || 80;
//             const { fromhost } = request.headers;
//             try {
//                 logging.write("Receiving Request",`received request for ${request.url} from ${fromhost || "unknown"}`);
//                 res = await requestHandler.callback({ host, port, path: request.url, headers: request.headers, data: body });
//             } catch(err) {
//                 logging.write("Receiving Request"," ", err.toString());
//                 const message = "Internal Server Error";
//                 res.statusCode = 500;
//                 res.statusMessage = message;
//                 res.headers = { "Content-Type":"text/plain", "Content-Length": Buffer.byteLength(message) };
//                 res.data = message;
//             } finally {
//                 response.writeHead( res.statusCode, res.statusMessage, res.headers).end(res.data);
//             }
//         });
//     });
//     httpServer.listen(privatePort);
//     logging.write("Request Listener", `listening on port ${privatePort}`);
// };