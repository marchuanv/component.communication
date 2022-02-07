const { HttpMessage } = require("./httpmessage.js");
const { HttpMessageStatus } = require("./httpmessagestatus.js");
const utils = require("utils");
const { Cache } = require("../cache.js");

const httpMessageStatus = new HttpMessageStatus();
const privateCache = new Cache();

function HttpRequestMessage({ httpMessage }) {

    let errors = [];
    this.Id = utils.generateGUID();
    let errorsCacheId = `${this.Id}_errors`;
    let httpMessageRefCacheId = `${this.Id}_http_message_ref`;

    privateCache.set(errorsCacheId, errors);

    if (httpMessage instanceof HttpMessage) {
        const messageErrors = httpMessage.getErrorMessages();
        if (messageErrors && messageErrors.length === 0) {
            privateCache.set(httpMessageRefCacheId, httpMessage);
            Object.assign(this, httpMessage);
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
        } else {
            errors.push(new Error("the 'message' parameter has errors."));
        }
    } else {
        errors.push(new Error("'message' parameter is undefined or not of type: HttpMessage"));
    }
};
HttpRequestMessage.prototype.Id = "ERROR";
HttpRequestMessage.prototype.getErrorMessages = function() {
    return privateCache.find(errorsCacheId);
};
HttpRequestMessage.prototype.getValidationMessages = function() {
    return privateCache.find(failedValidationCacheId);
};
HttpRequestMessage.prototype.validate = function() {
    const errors = [];
    let validationCacheId = `${this.Id}_validation`;
    let httpMessageRefCacheId = `${this.Id}_http_message_ref`;
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