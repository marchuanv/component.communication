(async() => {
    const { MessageFactory } = require("../messagefactory.js");
    const { HttpMessageFactory } = require("./httpmessagefactory.js");
    const messageFactory = new MessageFactory();
    const httpMessageFactory = new HttpMessageFactory();
    const message = messageFactory.createMessage({ name: "test1", content: { name:"bob" }, contentType: "json"});
    const httpRequestMessage = await httpMessageFactory.createHttpRequestMessage({ message });
    const systemMessages = httpRequestMessage.getSystemMessages();
    if (systemMessages.length > 0) {
        throw new Error("expected no system messages");
    }
})();
