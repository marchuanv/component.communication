const utils = require("utils");
function CommunicationMessage({ headers, body, statusCode, statusMessage }) {
    this.headers = headers;
    if (typeof body !== "string") {
        this.body = utils.getJSONString(body);
    } else {
        this.body = body;
    }
    this.retryCount = 1;
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
};
CommunicationMessage.prototype.validate = function() {
    if (!this.headers) {
        throw new Error("communication message requires valid headers");
    }
    if (!this.body) {
        throw new Error("communication message requires a valid json body");
    }
    if (!this.statusCode) {
        throw new Error("communication message requires a valid statusCode");
    }
    if (!this.statusMessage) {
        throw new Error("communication message requires a valid statusMessage");
    }
};
