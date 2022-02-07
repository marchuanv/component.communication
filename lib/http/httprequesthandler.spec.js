(async() => {
    const { HttpRequestHandler } = require("./httprequesthandler.js");
    const { HttpMessageFactory } = require("./httpmessagefactory.js");
    const httpMessageFactory = new HttpMessageFactory();
    const httpRequestHandler = new HttpRequestHandler({ name: "test", httpMessageFactory });

    const httpRequestHandlerErrors = await httpRequestHandler.getErrorMessages();
    if (httpRequestHandlerErrors.length > 0) {
        throw new Error("Test Failed");
    }

    await httpRequestHandler.handle( { requestHeaders: null, requestBody: null });
})();
