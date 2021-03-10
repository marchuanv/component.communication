(async()=>{ 
    
    require("./component.request.handler.js");
    const com = require("component");
    const delegate = require("component.delegate");

    delegate.register({ context: "component.request.handler.route", name: 3000 },() => {
        throw new Error("Error on port 3000");
    });
    delegate.register({ context: "component.request.handler.route", name: 4000 },() => {
        return {
            headers: { "content-type":"text/plain" },
            data: "route 02",
            statusMessage: "Success",
            statusCode: 200
        };
    });
    delegate.register({ context: "component.request.handler.route", name: 5000 },() => {
        throw new Error("Error on port 5000");
    });
    
    const { componentRequestUnsecure } = await com.require("component.request.unsecure", {gitUsername:"marchuanv"});
    let results = await componentRequestUnsecure.send({ host: "localhost", port: 3000, path: "/test", method: "GET", headers: {}, data: "", retryCount: 1  });
    results = await componentRequestUnsecure.send({ host: "localhost", port: 4000, path: "/test", method: "GET", headers: {}, data: "", retryCount: 1  });
    results = await componentRequestUnsecure.send({ host: "localhost", port: 5000, path: "/test", method: "GET", headers: {}, data: "", retryCount: 1  });
    results = await componentRequestUnsecure.send({ host: "localhost", port: 443, path: "/test", method: "GET", headers: {}, data: "", retryCount: 1  });
    results = await componentRequestUnsecure.send({ host: "localhost", port: 6000, path: "/test", method: "GET", headers: {}, data: "", retryCount: 1  });
    
})().catch((err)=>{
    console.error(err);
});
