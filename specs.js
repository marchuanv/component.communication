(async() => {
    const { Connection, RequestHandler } = require("./initialise.js");
    const connection = new Connection({ host: "localhost", port: 3000 });
    const callback = new RequestHandler({ priority: "High", callback: () => {
        console.log("handled");
    }});
    await connection.handle(callback);
    await connection.start();
})();

