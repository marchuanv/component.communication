const { Message } = require("../message.js");
const { HttpRequestMessage } = require("./httprequestmessage.js");
const { HttpResponseMessage } = require("./httpresponsemessage.js");
const { HttpMessage } = require("./httpmessage.js");
function HttpMessageFactory() {}
HttpMessageFactory.prototype.createRequestMessage = function({ name, content, contentType }) {
    let message = new Message({ name, content, contentType });
    message = new HttpMessage({ message });
    return new HttpRequestMessage( { message });
}
HttpMessageFactory.prototype.createResponseMessage = function({ name, content, contentType, statusCode, statusMessage }) {
    let message = new Message({ name, content, contentType });
    message = new HttpMessage({ message });
    return new HttpResponseMessage({ message, statusCode, statusMessage });
}

module.exports = { HttpMessageFactory };