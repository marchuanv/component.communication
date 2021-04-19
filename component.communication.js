const { CommunicationMessage, Communication } = require("./lib/communication.js");
process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    console.log('Closing http server.');
    host.close(() => {
        console.log('Http server closed.');
    });
});
module.exports = { CommunicationMessage, Communication };