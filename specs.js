const { Connection, RequestHandler } = require("./initialise.js");
(async() => {
    const connection = new Connection({ host: "localhost", port: 3000, ishttp: true, iswebsocket: false });
    const requestHandler = new RequestHandler({ name: "specs", callback: () => {}, isHttp: true, isWebSocket: true });
    await connection.register(requestHandler);
    await connection.open();
})();

