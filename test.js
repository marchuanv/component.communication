debugger;
const requestHandler = require("./component.request.handler.js");

const request = require("component.request");

const delegate = require("component.delegate");
delegate.register("component.request.handler.route",3000,() => {
    throw new Error("Error on port 3000");
});
delegate.register("component.request.handler.route",4000,() => {
    return {
        headers: {"content-type":"text/plain"},
        data: "route 02",
        statusMessage: "Success",
        statusCode: 200
    };
});
delegate.register("component.request.handler.route",5000,() => {
    throw new Error("Error on port 5000");
});

(async()=>{ 
    
    requestHandler.handle({ privateHost: "localhost", privatePort: 3000});
    requestHandler.handle({ privateHost: "localhost", privatePort: 4000});
    requestHandler.handle({ privateHost: "localhost", privatePort: 5000});
    requestHandler.handle({ privateHost: "localhost", privatePort: 5000});
    
    await request.send({ host: "localhost", port: 3000, path: "/test", method: "GET", headers: {}, data: {}, retryCount: 1  });
    
    process.exit();
    
})().catch((err)=>{
    console.error(err);
});
