const utils = require("utils");
const { Message } = require("../message.js");

function HttpMessage({ message }) {
    if (message instanceof Message) {
        this.message = message;
        this.headers = {};
        this.resourcePath = `${__dirname}.${this.message.name}.${this.message.contentType.name}`;
        delete this.headers["content-length"];
        this.headers["Content-Length"] = 0;
        this.headers["Content-Type"] = this.message.contentType.description;
    } else {
        throw new Error("message is undefined or not of type: Message");
    }
};
HttpMessage.prototype.validate = function() {
    this.message.validate();
    if (!this.headers) {
        throw new Error("http message requires headers");
    }
    if (this.headers["Content-Length"] === undefined) {
        throw new Error("http message requires Content-Length header");
    }
    if (this.headers["Content-Type"] === undefined) {
        throw new Error("http message requires Content-Type header");
    }
    if (!this.resourcePath) {
        throw new Error("http message requires a resource path");
    }
};
HttpMessage.prototype.toString = function() {
    if (this.MIMEType === "application/json") {
        let json;
        if (typeof this.message.content === "object") {
            json = utils.getJSONString(this.message.content);
        } else {
            json = this.message.content;
        }
        this.headers["Content-Length"] = Buffer.byteLength(json);
        return json;
    } else {
        throw new Error("unsupported MIMEType");
    }
};
module.exports = { HttpMessage };