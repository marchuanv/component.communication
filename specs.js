(async() => {
    const { Communication, CommunicationRequestHandler } = require("./initialise.js");
    const comm = new Communication({ host: "localhost", port: 3000 });
    const callback = new CommunicationRequestHandler({ priority: "High", callback: () => {
        console.log("handled");
    }});
    await comm.handle(callback);
    await comm.start();
})();

