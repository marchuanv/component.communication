const requestHandler = require("./component.request.handler.js");
const delegate = require("component.delegate");
(async()=>{ 
    requestHandler.handle({ privateHost: "localhost", privatePort: 3000});
    requestHandler.handle({ privateHost: "localhost", privatePort: 4000});
    requestHandler.handle({ privateHost: "localhost", privatePort: 5000});
})().catch((err)=>{
    console.error(err);
});