const { HttpMessage } = require("./httpmessage.js");
const { Cache } = require("../cache.js");
const privateCache = new Cache();
const errorsCacheId = "HttpMessage_Errors";
const failedValidationCacheId = "HttpMessage_FailedValidation";
const httpMessageRefCacheId = "HttpRequestMessage_HttpMessage";

function HttpResponseMessage({ message, statusCode, statusMessage }) {
    if (message instanceof HttpMessage) {
        privateCache.set(httpMessageRefCacheId, message);
        Object.assign(this, message);
        this.statusCode = statusCode;
        this.statusMessage = statusMessage;
        this.Errors.concat(message.Errors);
    } else {
        privateCache.set(errorsCacheId, [new Error("'message' parameter is undefined or not of type: HttpMessage")]);
    }
};
HttpResponseMessage.prototype.getErrorMessages = function() {
    return privateCache.find(errorsCacheId);
};
HttpResponseMessage.prototype.getValidationMessages = function() {
    return privateCache.find(failedValidationCacheId);
};
HttpResponseMessage.prototype.validate = function() {
    const errors = [];
    const message = privateCache.find(httpMessageRefCacheId);
    if (!message.validate()) {
        errors.concat(message.getValidationMessages());
    }
    if (!this.name) {
        errors.push(new Error("http response message requires a name"));
    }
    if (this.content === undefined) {
        errors.push(new Error("http response message requires content"));
    }
    if (!this.contentType) {
        errors.push(new Error("http response message requires content type"));
    }
    if (!this.headers) {
        errors.push(new Error("http response message requires headers"));
    }
    if (this.headers["Content-Length"] === undefined) {
        errors.push(new Error("http response message requires Content-Length header"));
    }
    if (this.headers["Content-Type"] === undefined) {
        errors.push(new Error("http response message requires Content-Type header"));
    }
    if (!this.resourcePath) {
        errors.push(new Error("http response message requires a resource path"));
    }
    if (!this.statusCode) {
        errors.push(new Error("http response message requires a status code"));
    }
    if (!this.statusMessage) {
        errors.push(new Error("http response message requires a status message"));
    }
    privateCache.set(failedValidationCacheId, errors);
    if (errors.length > 0) {
        return false;
    }
};
module.exports = { HttpResponseMessage };