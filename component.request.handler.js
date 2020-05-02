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
    register: ()=>{}
};