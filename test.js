const requestHandler = require("./component.request.handler.js");
const delegate = require("component.delegate");
(async()=>{ 
    const callingModule = "component.request.handler.route";
    delegate.register(callingModule, () => {
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: null };
    });
    await requestHandler.handle(callingModule, { privateHost: "localhost", privatePort: 3000 });
})().catch((err)=>{
    console.error(err);
});