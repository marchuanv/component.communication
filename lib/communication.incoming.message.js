const utils = require("utils");
function CommunicationIncomingMessage({ Id, headers, body }) {
    this.retryCount = 1;
    this.Id = Id;
    this.headers = headers;
    this.body = body || {};
    this.body = utils.getJSONObject(this.toString());
};
CommunicationIncomingMessage.prototype.validate = function() {
    if (!this.Id) {
        throw new Error("incoming communication message requires a valid id");
    }
    if (!this.headers) {
        throw new Error("incoming communication message requires valid headers");
    }
    if (!this.body) {
        throw new Error("incoming communication message requires a valid json body");
    }
};
CommunicationIncomingMessage.prototype.toString = function() {
    if (typeof this.body === "object") {
        return utils.getJSONString(this.body);    
    } else {
        return this.body;
    }
};
CommunicationIncomingMessage.prototype.isFromWebBrowser = function() {
    const userAgent = this.headers["user-agent"];
    return userAgent.indexOf("Mozilla") > -1 || userAgent.indexOf("Chrome") > -1 || userAgent.indexOf("Safari") > -1;
};
CommunicationIncomingMessage.prototype.isForResource = function() {
    return this.id.indexOf(".js") > -1 || this.id.indexOf(".html") > -1;
};
module.exports = { CommunicationIncomingMessage };