(async() => {
    const { HttpMessageFactory } = require("./httpmessagefactory.js");
    const httpMessageFactory = new HttpMessageFactory();
    const requestMessage = await httpMessageFactory.createRequestMessage({ 
        name: "test",
        headers: [],
        content: { name: "joe"},
        contentType: "json"
    });
    const systemMessages = requestMessage.getSystemMessages();
    if (systemMessages.length > 0) {
        throw new Error("expected no system messages");
    }
})();
