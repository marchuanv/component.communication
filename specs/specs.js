(async () => {
    const { Communication, CommunicationRequestHandlerCallback } = await require("../initialise.js");
    const comm = new Communication({ host: "localhost", port: 3000, ishttp: true,iswebsocket: false });
    await comm.start();

    const requestHandlerCallback = new CommunicationRequestHandlerCallback({ priority: "High" });
    requestHandlerCallback.handler = async () => {

    };
    await comm.receive(requestHandlerCallback);
})();
