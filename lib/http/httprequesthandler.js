const { HttpMessageFactory } = require("./httpmessagefactory.js");
const { HttpResponseHandler } = require("./httpresponsehandler.js");
const utils = require("utils");
const { Cache } = require("../cache.js");
const privateCache = new Cache();

const factoryRefCacheId = "HttpRequestHandler_MessageFactory";
const httpResponseHandlerRefCacheId = "HttpRequestHandler_HttpResponseHandler";

const requestedMessagesCacheId = "HttpRequestHandler_RequestedMessages";
const failedValidationCacheId = "HttpRequestHandler_FailedValidation";
const errorsCacheId = "HttpRequestHandler_Errors";
let intervalId = -1;

function HttpRequestHandler({ name, httpMessageFactory }) {
    this.Name = name;
    if (httpMessageFactory instanceof HttpMessageFactory) {
        privateCache.set(factoryRefCacheId, httpMessageFactory);
        privateCache.set(httpResponseHandlerRefCacheId, new HttpResponseHandler({ name, httpMessageFactory }));
    } else {
        privateCache.set(errorsCacheId, [new Error("'httpMessageFactory' parameter is not of type: HttpMessageFactory")] );
    }
}
HttpRequestHandler.prototype.handle = async function({ requestHeaders, requestBody }) {
    const httpMessageFactory = privateCache.find(factoryRefCacheId);
    const requestMessage = await httpMessageFactory.createRequestMessage({
        name: this.Name,
        headers: requestHeaders,
        content: requestBody,
        contentType: "txt"
    });
    if (requestMessage.validate()) {
        this.getRequestedMessages().push(requestMessage);
        if (intervalId == -1) {
            intervalId = setInterval(async () => {
                for(const msg of this.getRequestedMessages()){
                    if (msg.hasChanged) {
                        const httpResponseHandler = privateCache.find(httpResponseHandlerRefCacheId);
                        await httpResponseHandler.handle({ responseHeaders, responseBody, contentType, statusCode, statusMessage });
                    }
                };
            },1000);
        }
    } else {
        this.getValidationMessages().concat(requestMessage.getValidationMessages());
    }
}
HttpRequestHandler.prototype.getErrorMessages = function() {
    return privateCache.find(errorsCacheId);
}
HttpRequestHandler.prototype.getRequestedMessages = function () {
    return privateCache.find(requestedMessagesCacheId);
}
HttpRequestHandler.prototype.getValidationMessages = function() {
    return privateCache.find(failedValidationCacheId);
};
module.exports = { HttpRequestHandler };