const utils = require("utils");
function CommunicationMessage({ headers, body }) {
    this.headers = headers;
    if (typeof body !== "string") {
        this.body = utils.getJSONString(body);
    } else {
        this.body = body;
    }
    this.retryCount = 1;
};
CommunicationMessage.prototype.validate = function() {
    if (!headers) {
        throw new Error("communication message requires headers");
    }
    if (!body) {
        throw new Error("communication message requires a json body");
    }
};
