const { HttpMessageFactory } = require("./httpmessagefactory.js");
const utils = require("utils");
const { Cache } = require("../cache.js");
const privateCache = new Cache();
const factoryCacheId = "HttpRequestHandler_MessageFactory";
const successMessagesCacheId = "HttpRequestHandler_MessagesSuccess";
const failedMessagesCacheId = "HttpRequestHandler_FailedMessages";
const errorsCacheId = "HttpRequestHandler_Errors";

function HttpRequestHandler({ name, httpMessageFactory }) {
    this.Name = name;
    if (httpMessageFactory instanceof HttpMessageFactory) {
        privateCache.set(factoryCacheId, httpMessageFactory);
    } else {
        privateCache.set(errorsCacheId, [new Error("'httpMessageFactory' parameter is not of type: HttpMessageFactory")] );
    }
}
HttpRequestHandler.prototype.handle = async function({ requestHeaders, requestBody }) {
    const httpMessageFactory = privateCache.find(factoryCacheId);
    const requestMessage = await httpMessageFactory.createRequestMessage({
        name: this.name,
        headers: requestHeaders,
        content: requestBody,
        contentType: "txt"
    });
    await requestMessage.validate();




    this.getSuccessMessages().push(requestMessage);

    privateCache.set({ id: successMessagesCacheId, item:  requestMessage });
    // const response = await this.callback(requestMessage);
    // if (response) {
    //     const responseMessage = await this.HttpMessageFactory.createResponseMessage(response);
    //     await responseMessage.validate();
    //     return responseMessage;
    // } else {
    //     return null;
    // }
}
HttpRequestHandler.prototype.getFailedMessages = () => {
    return privateCache.find(failedMessagesCacheId);
}
HttpRequestHandler.prototype.getSuccessMessages = () => {
    return privateCache.find(successMessagesCacheId);
}
HttpRequestHandler.prototype.getErrorMessages = function() {
    return privateCache.find(errorsCacheId);
};
HttpRequestHandler.prototype.getValidationMessages = function() {
    return privateCache.find(failedValidationCacheId);
};
module.exports = { HttpRequestHandler };