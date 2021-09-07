const { ContentType } = require("./contenttype.js");
function Message({ name, content, contentType }) {
    this.name = name;
    this.content = content;
    this.contentType = contentType;
    if (this.contentType.name === "json" || this.contentType.name === "txt") {
        if (typeof this.content === "object") {
            this.content = utils.getJSONString(this.content);
        } else {
            this.content = this.content;
        }
    } else {
        throw new Error("unsupported content type");
    }
};
Message.prototype.validate = function() {
    if (!this.name) {
        throw new Error("message requires a name");
    }
    if (this.content === undefined) {
        throw new Error("message requires content");
    }
    if (!this.contentType) {
        throw new Error("message requires content type");
    }
    if (this.contentType instanceof ContentType) {

    } else {
        throw new Error("contentType is not of type: ContentType");
    }
};
module.exports = { Message };