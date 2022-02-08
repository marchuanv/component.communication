const { Message } = require("./message.js");
const { ContentType } = require("./contenttype.js");
function MessageFactory() {}
MessageFactory.prototype.createMessage = function({ name, content, contentType }) {
    return new Message({ name, content, contentType: new ContentType({ name: contentType })});
}
module.exports = { MessageFactory };