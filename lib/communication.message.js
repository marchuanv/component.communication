const utils = require("utils");
function CommunicationMessage({ Id, headers, body, statusCode, statusMessage }) {
    this.Id = Id;
    this.retryCount = 1;
    this.headers = headers;
    this.statusCode = statusCode;
    this.statusMessage = statusMessage;
    this.body = body;
    this.body = utils.getJSONObject(this.toString());
};
CommunicationMessage.prototype.validate = function() {
    if (!this.headers) {
        throw new Error("communication message requires a valid id");
    }
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
CommunicationMessage.prototype.toString = function() {
    return utils.getJSONString(this.body);
};
module.exports = { CommunicationMessage };