const { ContentType } = require("./contenttype.js");
const { Cache } = require("./cache.js");
const utils = require("utils");

const privateCache = new Cache();

function Message({ name, content, contentType }) {
    
    this.Id = utils.generateGUID();
    this.name = name;

    const systemMessages = [];
    const systemMessagesCacheId = `${this.Id}_systemMessages`;
    const contentCacheId = `${this.Id}_content`;
    const contentTypeCacheId = `${this.Id}_contenttype`;

    privateCache.set(systemMessagesCacheId, systemMessages);

    if (name === undefined || name === null) {
        systemMessages.push(new Error("'name' parameter is null or undefined"));
    }
    if (content === undefined || content === null) {
        systemMessages.push(new Error("'content' parameter is null or undefined"));
    }
    if (contentType === undefined || contentType === null) {
        systemMessages.push(new Error("'contentType' parameter is null or undefined"));
    }
    if (contentType instanceof ContentType) {
        if (contentType.name === "json" || contentType.name === "txt") {
            if (typeof content === "object") {
                content = utils.getJSONString(content);
            }
        } else {
            systemMessages.push(new Error("unsupported contentType"));
        }
    } else {
        systemMessages.push(new Error("'contentType' parameter is not of type: ContentType"));
    }
    privateCache.set(contentCacheId, content);
    privateCache.set(contentTypeCacheId, contentType);
};
Message.prototype.name = "ERROR";
Message.prototype.Id = "ERROR";
Message.prototype.getContent = function() {
    let contentCacheId = `${this.Id}_content`;
    return privateCache.find(contentCacheId);
}
Message.prototype.getContentType = function() {
    const contentTypeCacheId = `${this.Id}_contenttype`;
    return privateCache.find(contentTypeCacheId);
}
Message.prototype.getSystemMessages = function() {
    const systemMessagesCacheId = `${this.Id}_systemMessages`;
    return privateCache.find(systemMessagesCacheId);
};
Message.prototype.validate = function() {
   return true;
};
module.exports = { Message };