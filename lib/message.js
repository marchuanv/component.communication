const { ContentType } = require("./contenttype.js");
function Message({ name, content, contentType }) {
    this.name = name;
    this.content = content;
    this.contentType = contentType;
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