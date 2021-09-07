const { HttpMessage } = require("./httpmessage.js");
const { HttpMessageStatus } = require("./httpmessagestatus.js");
const httpMessageStatus = new HttpMessageStatus();

function HttpRequestMessage({ message }) {
    if (message instanceof HttpMessage) {
        this.message = message;
        const isPreflight =  this.message.headers["access-control-request-headers"] !== undefined;
        if(isPreflight) {
            this.statusCode = httpMessageStatus.Success;
            this.statusMessage = httpMessageStatus.getMessage(httpMessageStatus.Success);
            this.message.headers = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Expose-Headers": "*",
                "Access-Control-Allow-Headers": "*",
                "Content-Type": "text/plain"
            };
        }
    } else {
        throw new Error("message is undefined or not of type: HttpMessage");
    }
};
HttpRequestMessage.prototype.validate = function() {
    return this.message.validate();
};
HttpRequestMessage.prototype.toString = function() {
    return this.message.toString();
};
module.exports = { HttpRequestMessage };