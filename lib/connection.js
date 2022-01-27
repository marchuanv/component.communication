const { Logger } = require("component.logging");
const { RequestMessage } = require("./requestmessage.js");
const { RequestHandler } = require("./requesthandler.js");
const { HttpConnection } = require("./http/httpconnection.js");
const { WebSocketConnection } = require("./websocket/websocketconnection.js");
const { HttpMessageFactory } = require("./http/httpmessagefactory.js");
const { WebSocketMessageFactory } = require("./websocket/websocketmessagefactory.js");
const logging = new Logger({ componentName: "Communication Connection" });

function Connection({ host, port, requestHandler }) {
    if (!host || !port) {
        throw new Error("'host' and 'port' parameters are required");
    }
    if (requestHandler instanceof RequestHandler) {
        if (requestHandler.IsHttp) {
            this.connection = new HttpConnection({ host, port, httpMessageFactory: new HttpMessageFactory()});
        } else if (requestHandler.IsWebsocket) {
            this.connection = new WebSocketConnection({ host, port, webSocketMessageFactory: new WebSocketMessageFactory()});
        } else {
            throw new Error("failed to setup connection");
        }
        if (this.connection.requestHandlers.find(x => x.name === requestHandler.name)) {
            return logging.write(`the ${requestHandler.name} request handler is already registered`);
        }
        this.connection.requestHandlers.push(requestHandler);
    } else {
        return logging.write("'requestHandler' parameter is not of type RequestHandler");
    }
};
Connection.prototype.send = async function(message) {
    if (message instanceof RequestMessage) {
        return await this.connection.send(message);
    } else {
        return logging.write("'message' parameter is not of type: RequestMessage");
    }
};
Connection.prototype.open = async function() {
   await this.connection.open();
   logging.write(`connection open on ${this.connection.host}:${this.connection.port}`);

};
module.exports = { Connection };