const { HttpMessageFactory } = require("./httpmessagefactory.js");
function HttpRequestHandler({ name, httpMessageFactory, callback }) {
    if (httpMessageFactory instanceof HttpMessageFactory) {
        this.name = name;
        this.httpMessageFactory = httpMessageFactory;
        this.callback = callback;
    } else {
        throw new Error("httpMessageFactory is not of type: HttpMessageFactory");
    }
}
HttpRequestHandler.prototype.handle = function({ requestHeaders, requestBody }) {
    const requestMessage = this.httpMessageFactory.createRequestMessage({
        name: this.name,
        content: requestBody,
        contentType: requestHeaders["Content-Type"]
    });
    requestMessage.validate();
    const response = await this.callback(requestMessage);
    const responseMessage = this.httpMessageFactory.createResponseMessage(response);
    responseMessage.validate();
    return responseMessage;
}
module.exports = { HttpRequestHandler };