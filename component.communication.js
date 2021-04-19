const { Communication } = require("./lib/communication.js");
const { CommunicationMessage } = require("./lib/communication.message.js");
process.on('SIGTERM', () => {
    console.info('SIGTERM signal received.');
    console.log('Closing http server.');
    host.close(() => {
        console.log('Http server closed.');
    });
});
module.exports = { CommunicationMessage, Communication };