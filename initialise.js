(async() => {
    if (typeof module === "undefined") {
        console.log("creating module");
        window.module = { exports: null };
    }
    if (typeof require === "undefined") {
        window.require = (src) => {
            return new Promise( (resolve) => {
                var script = document.createElement('script');
                script.onload = () => {
                    resolve(module.exports);
                };
                script.src = src;
                document.getElementsByTagName('head')[0].appendChild(script);
            });
        }
        module.exports = await require("./lib/communication.js");
    } else {
        module.exports = require("./lib/communication.js");
    }
})();