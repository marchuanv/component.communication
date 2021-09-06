function CommunicationRequestHandlerCallback({ priority }) {
    if (priority === "High" || priority === "Low" ) {
        this.index = priority === "High" ? 1 : 0;
    } else {
        throw new Error("priority can only be High or Low");
    }
};
CommunicationRequestHandlerCallback.prototype.handle = function() {}; 
module.exports = CommunicationRequestHandlerCallback;