(async() => {
    const { Communication, CommunicationRequestHandlerCallback } = require("./initialise.js");
    const comm = new Communication({ host: "localhost", port: 3000 });
    const callback = new CommunicationRequestHandlerCallback({ priority: "High" });
    callback.handler = () => {

    };
    await comm.handle(callback);
    await comm.start();
})();

