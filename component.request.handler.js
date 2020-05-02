const http = require("http");
const logging = require("logging");
const utils = require("utils");
const componentRequestHandlerSecure = require("component.request.handler.secure");
module.exports = { 
    callback: async ({ host, port, path, headers, data })=>{
        return {
            statusCode: 200,
            statusMessage: "Success",
            headers: {

            },
            data: "Hello World"
        }
    }, 
    register: ()=>{}
};