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
    this.name = name;
    this.callback = callback;
    Object.defineProperty(this, 'handle', { writable: false, value: async function(param) {
        let handler = null;
        if (isHttp) {
            logging.write("Http Request Handler Created");
            handler = new HttpRequestHandler({ name, callback, httpMessageFactory: new HttpMessageFactory()});
        } else if (isWebSocket) {
            logging.write("Web Socket Request Handler Created");
            handler = new WebSocketRequestHandler({ name, callback, webSocketMessageFactory: new WebSocketMessageFactory()});
        }
        const message = await handler.handle(param);
        if (message) {
            const status = "?";
            const responseMessage = ResponseMessage({ message, status });
            await responseMessage.validate();
            return responseMessage;
        } else {
            return null;
        }
    }});
};
module.exports = { RequestHandler };