const { ContentType } = require("./contenttype.js");
const { Cache } = require("../cache.js");
const privateCache = new Cache();
const errorsCacheId = "Message_Errors";
const failedValidationCacheId = "Message_FailedValidation";

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
        privateCache.set(errorsCacheId,[new Error("unsupported content type")])
    }
};
Message.prototype.getErrorMessages = function() {
    return privateCache.find(errorsCacheId);
};
Message.prototype.getValidationMessages = function() {
    return privateCache.find(failedValidationCacheId);
};
Message.prototype.validate = function() {
    const errors = [];
    if (!this.name) {
        errors.push(new Error("message requires a name"));
    }
    if (this.content === undefined) {
        errors.push(new Error("message requires content"));
    }
    if (!this.contentType) {
        errors.push(new Error("message requires content type"));
    }
    if (this.contentType instanceof ContentType) {
    } else {
        errors.push(new Error("contentType is not of type: ContentType"));
    }
    privateCache.set(failedValidationCacheId, errors);
    if (errors.length > 0) {
        return false;
    }
};
module.exports = { Message };