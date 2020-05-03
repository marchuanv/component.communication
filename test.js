const requestHandler = require("./component.request.handler.js");
const logging = require("logging");
logging.config(["Request Handler"]);
const handle = async () => {
    (await requestHandler.handle({privatePort: 3000})).receive(async({ host, port, path, headers, data }) => {
        console.log("TEST: received request: ", {host, port, path, headers, data });
        handle();
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: null };
    });
};
(async()=>{ 
    await handle();
})().catch((err)=>{
    console.error(err);
});