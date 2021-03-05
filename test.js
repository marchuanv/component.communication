
const requestHandler = require("./component.request.handler.js");
const component = require("component");
const delegate = require("component.delegate");

delegate.register("component.request.handler.route",3000,() => {
    throw new Error("Error on port 3000");
});
delegate.register("component.request.handler.route",4000,() => {
    return {
        headers: { "content-type":"text/plain" },
        data: "route 02",
        statusMessage: "Success",
        statusCode: 200
    };
});
delegate.register("component.request.handler.route",5000,() => {
    throw new Error("Error on port 5000");
});

(async()=>{ 
    

    
    requestHandler.handle({ host: "localhost", port: 3000 });
    requestHandler.handle({ host: "localhost", port: 4000 });
    requestHandler.handle({ host: "localhost", port: 5000 });
    requestHandler.handle({ host: "localhost", port: 5000 });
    requestHandler.handle({ host: "localhost", port: 443 });
    requestHandler.handle({ host: "localhos", port: 6000 });
    
    const unsecureRequest = await component.require("component.request.unsecure", {gitUsername:"marchuanv"});
    await unsecureRequest.send({ host: "localhost", port: 3000, path: "/test", method: "GET", headers: {}, data: "", retryCount: 1  });
    await unsecureRequest.send({ host: "localhost", port: 4000, path: "/test", method: "GET", headers: {}, data: "", retryCount: 1  });
    await unsecureRequest.send({ host: "localhost", port: 5000, path: "/test", method: "GET", headers: {}, data: "", retryCount: 1  });
    await unsecureRequest.send({ host: "localhost", port: 443, path: "/test", method: "GET", headers: {}, data: "", retryCount: 1  });
    await unsecureRequest.send({ host: "localhost", port: 6000, path: "/test", method: "GET", headers: {}, data: "", retryCount: 1  });
    
})().catch((err)=>{
    console.error(err);
});
