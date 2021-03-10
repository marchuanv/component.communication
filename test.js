const Component = require("component");
(async()=>{ 
    const component = new Component("TEST");
    await component.require("component.request.handler", {gitUsername:"marchuanv"})
    component.delegate.register({ name: 3000 },() => {
        throw new Error("Error on port 3000");
    });
    component.delegate.register({ name: 4000 },() => {
        return {
            headers: { "content-type":"text/plain" },
            data: "route 02",
            statusMessage: "Success",
            statusCode: 200
        };
    });
    component.delegate.register({ name: 5000 },() => {
        throw new Error("Error on port 5000");
    });
    
    const { componentRequestUnsecure } = await component.require("component.request.unsecure", {gitUsername:"marchuanv"});
    let results = await componentRequestUnsecure.send({ host: "localhost", port: 3000, path: "/test", method: "GET", headers: {}, data: "", retryCount: 1  });
    results = await componentRequestUnsecure.send({ host: "localhost", port: 4000, path: "/test", method: "GET", headers: {}, data: "", retryCount: 1  });
    results = await componentRequestUnsecure.send({ host: "localhost", port: 5000, path: "/test", method: "GET", headers: {}, data: "", retryCount: 1  });
    results = await componentRequestUnsecure.send({ host: "localhost", port: 443, path: "/test", method: "GET", headers: {}, data: "", retryCount: 1  });
    results = await componentRequestUnsecure.send({ host: "localhost", port: 6000, path: "/test", method: "GET", headers: {}, data: "", retryCount: 1  });
    
})().catch((err)=>{
    console.error(err);
});
