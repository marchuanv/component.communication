const { HttpMessage } = require("./httpmessage.js");
const { HttpMessageStatus } = require("./httpmessagestatus.js");
const utils = require("utils");
const { Cache } = require("../cache.js");

const httpMessageStatus = new HttpMessageStatus();
const privateCache = new Cache();

function HttpRequestMessage({ httpMessage }) {

    let systemMessages = [];
    this.Id = utils.generateGUID();
    let systemMessagesCacheId = `${this.Id}_systemMessages`;
    privateCache.set(systemMessagesCacheId, systemMessages);

    if (httpMessage instanceof HttpMessage) {

        this.Id = message.Id;
        let systemMessagesCacheId = `${this.Id}_systemMessages`;
        privateCache.set(systemMessagesCacheId, systemMessages);

        const depErrorMessages = httpMessage.getErrorMessages();
        if (depErrorMessages && depErrorMessages.length === 0) {
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
            systemMessages.push(new Error("the 'message' parameter has errors."));
        }
    } else {
        systemMessages.push(new Error("'message' parameter is undefined or not of type: HttpMessage"));
    }
};
HttpRequestMessage.prototype.name = "ERROR";
HttpRequestMessage.prototype.Id = "ERROR";
HttpRequestMessage.prototype.getSystemMessages = function() {

    let systemMessages = [];
    this.Id = utils.generateGUID();
    let systemMessagesCacheId = `${this.Id}_systemMessages`;
    privateCache.set(systemMessagesCacheId, systemMessages);

    if (!this.name) {
        systemMessages.push(new Error("http request message requires a name"));
    }
    if (this.content === undefined) {
        systemMessages.push(new Error("http request message requires content"));
    }
    if (!this.contentType) {
        systemMessages.push(new Error("http request message requires content type"));
    }
    if (!this.headers) {
        systemMessages.push(new Error("http request message requires headers"));
    }
    if (this.headers["Content-Length"] === undefined || this.headers["Content-Length"] === null) {
        systemMessages.push(new Error("http request message requires Content-Length header"));
    }
    if (this.headers["Content-Type"] === undefined || this.headers["Content-Type"] === null) {
        systemMessages.push(new Error("http request message requires Content-Type header"));
    }
    if (!this.resourcePath) {
        systemMessages.push(new Error("http request message requires a resource path"));
    }
    return systemMessages;
};
module.exports = { HttpRequestMessage };