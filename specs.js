(async() => {
    await require("./lib/message.spec.js");
    await require("./lib/http/httpmessage.spec.js");
    await require("./lib/http/httprequestmessage.spec.js");
})();

