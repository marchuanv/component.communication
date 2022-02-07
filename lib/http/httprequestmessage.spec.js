const { Message } = require("../message.js");

(async() => {

    const { HttpRequestMessage } = require("./httprequestmessage.js");
    const { HttpMessage } = require("./httpmessage.js");

    const message = new Message({ name: "test", content: { something: 'something' }, contentType: "application/json" });
    const httpMessage = new HttpMessage({ message });
    const httpRequestMessage = new HttpRequestMessage({ httpMessage })

    const httpRequestHandlerErrors = await httpRequestMessage.getErrorMessages();
    if (httpRequestHandlerErrors.length > 0) {
        throw new Error("Test Failed");
    }
    
})();
