const { Logger } = require("component.logging");
const { ResponseMessage } = require("./responsemessage.js");
const { HttpRequestHandler } = require("./http/httprequesthandler.js");
const { WebSocketRequestHandler } = require("./websocket/websocketrequesthandler.js");
const { WebSocketMessageFactory } = require("./websocket/websocketmessagefactory.js");
const { HttpMessageFactory } = require("./http/httpmessagefactory.js");

const logging = new Logger({ componentName: "Communication Request Handler" });

function RequestHandler({ name, callback, isHttp, isWebSocket }) {
    if (!name) {
        throw new Error("name must be provided");
    } 
    if (typeof callback !== "function") {
        throw new Error("callback must be a function");
    }
    if (isHttp) {
        logging.write("Request Handler configured for http");
        const httpRequestHandler = new HttpRequestHandler({ name, callback, httpMessageFactory: new HttpMessageFactory()})
        Object.defineProperty(this, 'handle', { writable: false, value: async function(param) {
            const message = await httpRequestHandler.handle(param);
            const status = "?";
            const responseMessage = ResponseMessage({ message, status });
            await responseMessage.validate();
            return responseMessage;
        }});
    }
    if (isWebSocket) {
        logging.write("Request Handler configured for web sockets");
        const websocketRequestHandler = new WebSocketRequestHandler({ name, callback, webSocketMessageFactory: new WebSocketMessageFactory()})
        Object.defineProperty(this, 'handle', { writable: false, value: async function(param) {
            const message = await websocketRequestHandler.handle(param);
            const status = "?";
            const responseMessage = ResponseMessage({ message, status });
            await responseMessage.validate();
            return responseMessage;
        }});
    }
};
module.exports = { RequestHandler };