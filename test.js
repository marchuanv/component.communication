const requestHandler = require("./component.request.handler.js");

const delegate = require("component.delegate");
delegate.register("component.request.handler.route","route01",() => {
    //throw new Error("failure route 01");
});
delegate.register("component.request.handler.route","route02",() => {
    return {
        headers: {"content-type":"text/plain"},
        data: "route 02",
        statusMessage: "Success",
        statusCode: 200
    };
});
delegate.register("component.request.handler.route","route03",() => {
    //throw new Error("failure route 03");
});

(async()=>{ 
    requestHandler.handle({ privateHost: "localhost", privatePort: 3000});
    requestHandler.handle({ privateHost: "localhost", privatePort: 4000});
    requestHandler.handle({ privateHost: "localhost", privatePort: 5000});
    requestHandler.handle({ privateHost: "localhost", privatePort: 5000});
})().catch((err)=>{
    console.error(err);
});