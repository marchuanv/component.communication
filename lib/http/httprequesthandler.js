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
HttpRequestHandler.prototype.handle = async function({ requestHeaders, requestBody }) {
    const requestMessage = await this.httpMessageFactory.createRequestMessage({
        name: this.name,
        content: requestBody,
        contentType: "txt"
    });
    await requestMessage.validate();
    const response = await this.callback(requestMessage);
    const responseMessage = await this.httpMessageFactory.createResponseMessage(response);
    await responseMessage.validate();
    return responseMessage;
}
module.exports = { HttpRequestHandler };