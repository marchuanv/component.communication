const { HttpMessageFactory } = require("./httpmessagefactory.js");
const utils = require("utils");
const { Cache } = require("../cache.js");
const privateCache = new Cache();
const factoryRefCacheId = "HttpResponseHandler_MessageFactory";
const failedValidationCacheId = "HttpResponseHandler_FailedValidation";
const errorsCacheId = "HttpResponseHandler_Errors";

function HttpResponseHandler({ name, httpMessageFactory }) {
    this.Name = name;
    if (httpMessageFactory instanceof HttpMessageFactory) {
        privateCache.set(factoryRefCacheId, httpMessageFactory);
    } else {
        privateCache.set(errorsCacheId, [new Error("'httpMessageFactory' parameter is not of type: HttpMessageFactory")] );
    }
}
HttpResponseHandler.prototype.handle = async function({ responseHeaders, responseBody, contentType, statusCode, statusMessage }) {
    const httpMessageFactory = privateCache.find(factoryRefCacheId);
    const responseMessage = await httpMessageFactory.createResponseMessage({
        name: this.Name,
        headers: responseHeaders,
        content: responseBody,
        contentType,
        statusCode,
        statusMessage 
    });
    if (responseMessage.validate()) {
        return responseMessage;
    } else {
        this.getValidationMessages().concat(responseMessage.getValidationMessages());
    }
}
HttpResponseHandler.prototype.getErrorMessages = function() {
    return privateCache.find(errorsCacheId);
}
HttpResponseHandler.prototype.getValidationMessages = function() {
    return privateCache.find(failedValidationCacheId);
};
module.exports = { HttpResponseHandler };