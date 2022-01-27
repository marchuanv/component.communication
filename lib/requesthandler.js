const { Logger } = require("component.logging");
const { ResponseMessage } = require("./responsemessage.js");
const { HttpRequestHandler } = require("./http/httprequesthandler.js");
const { WebSocketRequestHandler } = require("./websocket/websocketrequesthandler.js");
const { WebSocketMessageFactory } = require("./websocket/websocketmessagefactory.js");
const { HttpMessageFactory } = require("./http/httpmessagefactory.js");

const logging = new Logger({ componentName: "Communication Request Handler" });

function RequestHandler({ name, callback, ishttp, iswebsocket }) {
    if (!name) {
        throw new Error("name must be provided");
    } 
    if (typeof callback !== "function") {
        throw new Error("callback must be a function");
    }
    this.IsHttp = ishttp;
    this.IsWebSocket = iswebsocket;
    this.name = name;
    this.callback = callback;
    const locCallback = this.callback;
    Object.defineProperty(this, 'handle', { writable: false, value: async(param) => {
        let requestHandler = null;
        if (this.IsHttp) {
            logging.write("Http Request Handler Created");
            requestHandler = new HttpRequestHandler({ name, locCallback, httpMessageFactory: new HttpMessageFactory()});
        } else if (this.IsWebSocket) {
            logging.write("Web Socket Request Handler Created");
            requestHandler = new WebSocketRequestHandler({ name, locCallback, webSocketMessageFactory: new WebSocketMessageFactory()});
        }
        const message = await requestHandler.handle(param);
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
RequestHandler.prototype.IsHttp = false;
RequestHandler.prototype.IsWebSocket = false;
RequestHandler.prototype.name = "";
RequestHandler.prototype.callback = () => { throw new Error("callback undefined")};
module.exports = { RequestHandler };