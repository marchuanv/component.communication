const utils = require("utils");
const path = require("path");
const { Message } = require("../message.js");

function HttpMessage({ message }) {
    if (message instanceof Message) {
        Object.assign(this, message);
        this.contentType = this.contentType.name;
        this.headers = {};
        this.resourcePath = path.resolve(`${__dirname}//${this.name}.${this.contentType}`);
        delete this.headers["content-length"];
        this.headers["Content-Length"] = Buffer.byteLength(this.content);
        this.headers["Content-Type"] = message.contentType.description;
    } else {
        throw new Error("message is undefined or not of type: Message");
    }
};
HttpMessage.prototype.validate = function() {
    if (!this.name) {
        throw new Error("http message requires a name");
    }
    if (this.content === undefined) {
        throw new Error("http message requires content");
    }
    if (!this.contentType) {
        throw new Error("http message requires content type");
    }
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
module.exports = { HttpMessage };