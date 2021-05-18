const utils = require("utils");
function CommunicationResponseMessage({ Id, headers, body, status }) {
    this.retryCount = 1;
    this.Id = Id;
    this.headers = headers;
    this.body = body || {};
    this.body = utils.getJSONObject(this.toString());
    this.status = status || "None";
};
CommunicationResponseMessage.prototype.validate = function() {
    if (!this.Id) {
        throw new Error("response communication message requires a valid id");
    }
    if (!this.headers) {
        throw new Error("response communication message requires valid headers");
    }
    if (!this.body) {
        throw new Error("response communication message requires a valid json body");
    }
    if (!this.status) {
        throw new Error("response communication message requires a valid status");
    }
};
CommunicationResponseMessage.prototype.toString = function() {
    if (typeof this.body === "object") {
        return utils.getJSONString(this.body);    
    } else {
        return this.body;
    }
};
module.exports = { CommunicationResponseMessage };