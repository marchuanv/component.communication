const utils = require("utils");
const communicationStatus = require("./communication.status.js");

function CommunicationResponseMessage({ Id, headers, body, status, statusCode, statusMessage }) {
    this.retryCount = 1;
    this.Id = Id;
    this.headers = headers;
    this.body = body || {};
    this.body = utils.getJSONObject(this.toString());
    const mapping = communicationStatus[status] || {};
    this.statusCode = statusCode || mapping.statusCode;
    this.statusMessage = statusMessage|| mapping.statusMessage;
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
    if (!this.statusCode) {
        throw new Error("response communication message requires a valid status code");
    }
    if (!this.statusMessage) {
        throw new Error("response communication message requires a valid status message");
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