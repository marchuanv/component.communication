const { ContentType } = require("./contenttype.js");
const { Message } = require("./message.js");

(async() => {
    const contentType = new ContentType({ name: "json" });
    const message = new Message({ name: "test", content: { something: 'something' }, contentType });
    await message.validate();
    const systemMessages = await message.getSystemMessages();
    if (systemMessages.length > 0) {
        throw new Error("expected no system messages");
    }
})().catch((err)=>{
    console.log("Test Failed: ", err);
});
