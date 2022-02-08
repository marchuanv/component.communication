const { Message } = require("../message.js");
const { HttpRequestMessage } = require("./httprequestmessage.js");
const { HttpResponseMessage } = require("./httpresponsemessage.js");
const { HttpMessage } = require("./httpmessage.js");
const { ContentType } = require("../contenttype.js");
function HttpMessageFactory() {}
HttpMessageFactory.prototype.createHttpRequestMessage = function({ message }) {
    if (message instanceof Message) {
        let httpMessage = new HttpMessage({ message });
        return  new HttpRequestMessage( { httpMessage });
    } else {
        throw new Error("'message' parameter is undefined, null or not of type: Message");
    }
}
HttpMessageFactory.prototype.createHttpResponseMessage = function({ message }) {
    if (message instanceof Message) {
        let httpMessage = new HttpMessage({ message });
        return  new HttpResponseMessage( { httpMessage });
    } else {
        throw new Error("'message' parameter is undefined, null or not of type: Message");
    }
}
module.exports = { HttpMessageFactory };