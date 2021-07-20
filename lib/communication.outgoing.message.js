const utils = require("utils");
function CommunicationOutgoingMessage({ Id, headers, body }) {
    this.retryCount = 1;
    this.Id = Id;
    this.headers = headers;
    this.body = body || {};
    this.body = utils.getJSONObject(this.toString());
};
CommunicationOutgoingMessage.prototype.validate = function() {
    if (!this.Id) {
        throw new Error("outgoing communication message requires a valid id");
    }
    if (!this.headers) {
        throw new Error("outgoing communication message requires valid headers");
    }
    if (!this.body) {
        throw new Error("outgoing communication message requires a valid json body");
    }
};
CommunicationOutgoingMessage.prototype.toString = function() {
    if (typeof this.body === "object") {
        return utils.getJSONString(this.body);
    } else {
        return this.body;
    }
};
module.exports = { CommunicationOutgoingMessage };