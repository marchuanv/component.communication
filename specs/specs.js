(async () => {
    const { Communication } = await require("../initialise.js");
    const comm = new Communication({ host: "localhost", port: 3000, ishttp: true,iswebsocket: false });
    comm.start();
    comm.receive((message) => {
       console.log(message);
    });
})();
