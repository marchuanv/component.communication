(async() => {
    const { HttpMessageFactory } = require("./httpmessagefactory.js");
    const httpMessageFactory = new HttpMessageFactory();
    await httpMessageFactory.createRequestMessage({ 
        name: "test",
        headers: [],
        content: { name: "joe"},
        contentType: "json"
    });
})();
