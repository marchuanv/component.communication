const path = require("path");
const { Message } = require("../message.js");
const { Cache } = require("../cache.js");
const privateCache = new Cache();

function HttpMessage({ message }) {
    const systemMessages = [];
    if (message instanceof Message) {
        this.Id = message.Id;
        
        const systemMessagesCacheId = `${this.Id}_systemMessages`;
        privateCache.set(systemMessagesCacheId, systemMessages);

        const depSystemMessages = message.getSystemMessages();
        if (depSystemMessages && depSystemMessages.length === 0) {
            Object.assign(this, message);
            this.contentType = message.getContentType().name;
            this.headers = {};
            this.content = message.getContent();
            this.resourcePath = path.resolve(`${__dirname}//resources//${this.name}.${this.contentType}`);
            delete this.headers["content-length"];
            this.headers["Content-Length"] = Buffer.byteLength(this.content);
            this.headers["Content-Type"] = message.getContentType().description;
        } else {
            systemMessages.push(new Error("the 'message' parameter has system messages."));
        }
    } else {
        this.Id = utils.generateGUID();
        const systemMessagesCacheId = `${this.Id}_systemMessages`;
        privateCache.set(systemMessagesCacheId, systemMessages);
        systemMessages.push(new Error("'message' parameter is undefined, null or not of type: Message"));
    }
};
HttpMessage.prototype.name = "ERROR";
HttpMessage.prototype.Id = "ERROR";
HttpMessage.prototype.getSystemMessages = function() {
    const systemMessagesCacheId = `${this.Id}_systemMessages`;
    const systemMessages = privateCache.find(systemMessagesCacheId);
    if (!this.name) {
        systemMessages.push(new Error("http message requires a valid name"));
    }
    if (this.content === undefined || this.content === null) {
        systemMessages.push(new Error("http message requires valid content"));
    }
    if (!this.contentType) {
        systemMessages.push( new Error("http message requires a valid content type"));
    }
    if (!this.headers) {
        systemMessages.push( new Error("http message requires headers"));
    }
    if (this.headers["Content-Length"] === undefined || this.headers["Content-Length"] === null) {
        systemMessages.push( new Error("http message requires a Content-Length header"));
    }
    if (this.headers["Content-Type"] === undefined || this.headers["Content-Type"] === null) {
        systemMessages.push( new Error("http message requires a Content-Type header"));
    }
    if (!this.resourcePath) {
        systemMessages.push( new Error("http message requires a resource path"));
    }
    return systemMessages;
};
module.exports = { HttpMessage };
