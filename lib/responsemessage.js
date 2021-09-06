const utils = require("utils");
const { MessageStatus } = require("./messagestatus.js");
const messageStatus = new MessageStatus();

function ResponseMessage({ Id, headers, body, status, statusCode, statusMessage }) {
    this.retryCount = 1;
    this.Id = Id;
    this.headers = headers;
    this.body = body || {};
    this.body = utils.getJSONObject(this.toString());
    this.statusCode = statusCode || messageStatus.getStatusCode(status);
    this.statusMessage = statusMessage|| messageStatus.getStatusMessage(status);
};
ResponseMessage.prototype.validate = function() {
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
ResponseMessage.prototype.toString = function() {
    let json;
    if (typeof this.body === "object") {
        json = utils.getJSONString(this.body);    
    } else {
        json = this.body;
    }
    delete this.headers["content-length"];
    this.headers["Content-Length"] = Buffer.byteLength(json);
    return json;
};
module.exports = { ResponseMessage };