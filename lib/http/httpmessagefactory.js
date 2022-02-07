const { Message } = require("../message.js");
const { HttpRequestMessage } = require("./httprequestmessage.js");
const { HttpResponseMessage } = require("./httpresponsemessage.js");
const { HttpMessage } = require("./httpmessage.js");
const { ContentType } = require("../contenttype.js");
function HttpMessageFactory() {}
HttpMessageFactory.prototype.createRequestMessage = function({ name, headers, content, contentType }) {
    let message = new Message({ name, content, contentType: new ContentType({ name: contentType }) });
    message = new HttpMessage({ message });
    return  new HttpRequestMessage( { message });
}
HttpMessageFactory.prototype.createResponseMessage = function({ name, headers, content, contentType, statusCode, statusMessage }) {
    let message = new Message({ name, content, contentType: new ContentType({ name: contentType }) });
    message = new HttpMessage({ message });
    return new HttpResponseMessage({ message, statusCode, statusMessage });
}
module.exports = { HttpMessageFactory };