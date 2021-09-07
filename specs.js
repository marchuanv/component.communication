(async() => {
    const { Connection } = require("./initialise.js");
    const connection = new Connection({ host: "localhost", port: 3000, ishttp: true, iswebsocket: false });
    // const callback = new RequestHandler({ Id: "testing", priority: "High", callback: () => {
    //     console.log("handled");
    //     return {};
    // }});
    // await connection.handle(callback);
    await connection.open();
})();

