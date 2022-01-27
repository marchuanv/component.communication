const path = require("path");
const { Message } = require("../message.js");
const { Cache } = require("../cache.js");
const privateCache = new Cache();
const errorsCacheId = "HttpMessage_Errors";
const failedValidationCacheId = "HttpMessage_FailedValidation";
const messageRefCacheId = "HttpMessage_Message";

function HttpMessage({ message }) {
    if (message instanceof Message) {
        privateCache.set(messageRefCacheId, message);
        Object.assign(this, message);
        this.contentType = this.contentType.name;
        this.headers = {};
        this.resourcePath = path.resolve(`${__dirname}//${this.name}.${this.contentType}`);
        delete this.headers["content-length"];
        this.headers["Content-Length"] = Buffer.byteLength(this.content);
        this.headers["Content-Type"] = message.contentType.description;
    } else {
        privateCache.set(errorsCacheId, [new Error("'message' parameter is undefined or not of type: Message")]);
    }
};
HttpMessage.prototype.getErrorMessages = function() {
    return privateCache.find(errorsCacheId);
};
HttpMessage.prototype.getValidationMessages = function() {
    return privateCache.find(failedValidationCacheId);
};
HttpMessage.prototype.validate = function() {
    const errors = [];
    const message = privateCache.find(messageRefCacheId);
    if (!message.validate()) {
        errors.concat(message.getValidationMessages());
    }
    if (!this.name) {
        errors.push(new Error("http message requires a name"));
    }
    if (this.content === undefined) {
        errors.push( new Error("http message requires content"));
    }
    if (!this.contentType) {
        errors.push( new Error("http message requires content type"));
    }
    if (!this.headers) {
        errors.push( new Error("http message requires headers"));
    }
    if (this.headers["Content-Length"] === undefined) {
        errors.push( new Error("http message requires Content-Length header"));
    }
    if (this.headers["Content-Type"] === undefined) {
        errors.push( new Error("http message requires Content-Type header"));
    }
    if (!this.resourcePath) {
        errors.push( new Error("http message requires a resource path"));
    }
    privateCache.set(failedValidationCacheId, errors);
    if (errors.length > 0){
        return false;
    }
};
module.exports = { HttpMessage };