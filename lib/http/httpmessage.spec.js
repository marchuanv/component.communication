const { ContentType } = require("../contenttype.js");
const { Message } = require("../message.js");
const { HttpMessage } = require("./httpmessage.js");

(async() => {
    const contentType = new ContentType({ name: "json" });
    const message = new Message({ name: "test", content: { something: 'something' }, contentType });
    await message.validate();
    let systemMessages = await message.getSystemMessages();
    if (systemMessages.length > 0) {
        throw new Error("expected no system messages");
    }
    const httpMessage = new HttpMessage({ message });
    systemMessages = await httpMessage.getSystemMessages();
    if (systemMessages.length > 0) {
        throw new Error("expected no system messages");
    }
})().catch((err)=>{
    console.log("Test Failed: ", err);
});
