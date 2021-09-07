const { Logger } = require("component.logging");
const { RequestMessage } = require("./requestmessage.js");
const { RequestHandler } = require("./requesthandler.js");
const { HttpConnection } = require("./http/httpconnection.js");
const { WebSocketConnection } = require("./websocket/websocketconnection.js");
const { HttpMessageFactory } = require("./http/httpmessagefactory.js");
const { WebSocketMessageFactory } = require("./websocket/websocketmessagefactory.js");
const logging = new Logger({ componentName: "Communication Connection" });

function Connection({ host, port, ishttp, iswebsocket }) {
    if (!host || !port) {
        throw new Error("host and port is required");
    }
    if (ishttp) {
        this.connection = new HttpConnection({ host, port, httpMessageFactory: new HttpMessageFactory()});
    }
    if (iswebsocket) {
        this.connection = new WebSocketConnection({ host, port, webSocketMessageFactory: new WebSocketMessageFactory()});
    }
};
Connection.prototype.send = async function(message) {
    if (message instanceof RequestMessage) {
        return await this.connection.send(message);
    } else {
        return logging.write("message is not of type: RequestMessage");
    }
};
Connection.prototype.register = function(handler) {
    if (handler instanceof RequestHandler) {
        const existingRequestHandler = this.connection.requestHandlers.find(x => x.name === handler.name);
        if (existingRequestHandler) {
            return logging.write(`the ${handler.name} request handler is already registered`);
        }
        this.connection.requestHandlers.push(handler);
    } else {
        return logging.write("handler is not of type RequestHandler");
    }
};
Connection.prototype.open = async function() {
   await this.connection.open();
   logging.write(`connection open on ${this.connection.host}:${this.connection.port}`);

};
module.exports = { Connection };