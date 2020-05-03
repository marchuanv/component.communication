const requestHandler = require("./component.request.handler.js");
const logging = require("logging");
logging.config(["Request Handler"]);
const handle = async () => {
    (await requestHandler.port({privatePort: 3000})).handle(async({ path, headers, data }) => {
        handle();
        console.log("TEST: received request: ", {host, port, path, headers, data });
        return { statusCode: 200, statusMessage: "Success", headers: {}, data: null };
    });
};
(async()=>{ 
    await handle();
})().catch((err)=>{
    console.error(err);
});