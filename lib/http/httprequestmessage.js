const { HttpMessage } = require("./httpmessage.js");
const { HttpMessageStatus } = require("./httpmessagestatus.js");
const httpMessageStatus = new HttpMessageStatus();
const { Cache } = require("../cache.js");
const privateCache = new Cache();
const errorsCacheId = "HttpMessage_Errors";
const failedValidationCacheId = "HttpMessage_FailedValidation";
const httpMessageRefCacheId = "HttpRequestMessage_HttpMessage";

function HttpRequestMessage({ message }) {
    if (message instanceof HttpMessage) {
        privateCache.set(httpMessageRefCacheId, message);
        Object.assign(this, message);
        const isPreflight =  this.headers["access-control-request-headers"] !== undefined;
        if(isPreflight) {
            this.statusCode = httpMessageStatus.Success;
            this.statusMessage = httpMessageStatus.getMessage(httpMessageStatus.Success);
            this.headers = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Expose-Headers": "*",
                "Access-Control-Allow-Headers": "*",
                "Content-Type": "text/plain"
            };
        }
        this.Errors.concat(message.Errors);
    } else {
        privateCache.set(errorsCacheId, [new Error("'message' parameter is undefined or not of type: HttpMessage")]);
    }
};
HttpRequestMessage.prototype.getErrorMessages = function() {
    return privateCache.find(errorsCacheId);
};
HttpRequestMessage.prototype.getValidationMessages = function() {
    return privateCache.find(failedValidationCacheId);
};
HttpRequestMessage.prototype.validate = function() {
    const errors = [];
    const message = privateCache.find(httpMessageRefCacheId);
    if (!message.validate()) {
        errors.concat(message.getValidationMessages());
    }
    if (!this.name) {
        errors.push(new Error("http request message requires a name"));
    }
    if (this.content === undefined) {
        errors.push(new Error("http request message requires content"));
    }
    if (!this.contentType) {
        errors.push(new Error("http request message requires content type"));
    }
    if (!this.headers) {
        errors.push(new Error("http request message requires headers"));
    }
    if (this.headers["Content-Length"] === undefined) {
        errors.push(new Error("http request message requires Content-Length header"));
    }
    if (this.headers["Content-Type"] === undefined) {
        errors.push(new Error("http request message requires Content-Type header"));
    }
    if (!this.resourcePath) {
        errors.push(new Error("http request message requires a resource path"));
    }
    privateCache.set(failedValidationCacheId, errors);
    if (errors.length > 0) {
        return false;
    }
};
module.exports = { HttpRequestMessage };