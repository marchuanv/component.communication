(async() => {
    const { MessageFactory } = require("./messagefactory.js");
    const messageFactory = new MessageFactory();
    const message = await messageFactory.createMessage({ name: "test", content: { name: "joe"}, contentType: "json" });
    const systemMessages = message.getSystemMessages();
    if (systemMessages.length > 0) {
        throw new Error("expected no system messages");
    }
})();
