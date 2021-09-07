const { Message } = require("../message.js");
const { HttpRequestMessage } = require("./httprequestmessage.js");
const { HttpResponseMessage } = require("./httpresponsemessage.js");
const { HttpMessage } = require("./httpmessage.js");
const { ContentType } = require("../contenttype.js");
function HttpMessageFactory() {}
HttpMessageFactory.prototype.createRequestMessage = function({ name, content, contentType }) {
    let message = new Message({ name, content, contentType: new ContentType({ name: contentType }) });
    message.validate();
    message = new HttpMessage({ message });
    message.validate();
    message = new HttpRequestMessage( { message });
    message.validate();
    return message;
}
HttpMessageFactory.prototype.createResponseMessage = function({ name, content, contentType, statusCode, statusMessage }) {
    let message = new Message({ name, content, contentType: new ContentType({ name: contentType }) });
    message.validate();
    message = new HttpMessage({ message });
    message.validate();
    message = new HttpResponseMessage({ message, statusCode, statusMessage });
    message.validate();
    return message;
}

module.exports = { HttpMessageFactory };