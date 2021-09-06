const logging = require("component.logging");
logging.register({ componentName: "component.communication.requesthandler" });
const { CommunicationStatus } = require("./communication.status.js");
const communicationStatus = new CommunicationStatus();
const { CommunicationIncomingMessage } = require("./communication.incoming.message.js");

function RequestHandler({ priority, callback }) {
    if (priority === "High" || priority === "Low" ) {
        this.index = priority === "High" ? 1 : 0;
    } else {
        throw new Error("priority can only be High or Low");
    }
    if (typeof callback !== "function") {
        throw new Error("callback must be a function");
    }
    this.callback = callback;
    this.response = {
        statusCode: 500,
        statusMessage: communicationStatus.getStatusMessage(500),
        headers: {},
        body: communicationStatus.getStatusMessage(500)
    };
    Object.defineProperty(this, 'handle', { writable: false, value: async function({ url, requestHeaders, requestBody }) {
        const defaultHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Expose-Headers": "*",
            "Access-Control-Allow-Headers": "*",
            "Content-Type": "text/plain"
        };
        const isPreflight = requestHeaders["access-control-request-headers"] !== undefined;
        if(isPreflight) {
            this.response.statusCode = 200;
            this.response.statusMessage = communicationStatus.getStatusMessage(response.statusCode);
            this.response.headers = defaultHeaders;
        } else {
            const incomingMessage = new CommunicationIncomingMessage({ Id: url.replace("/",""), headers: requestHeaders, body: requestBody });
            let bodyCollate = [];
            let hasSelectedHeaders = false;
            try {
                await incomingMessage.validate();
                let responseMessages = await this.callback(incomingMessage);
                if (responseMessages) {
                    if (!Array.isArray(responseMessages)) {
                        responseMessages = [responseMessages]; 
                    }
                    for(const responseMessage of responseMessages) {
                        if (responseMessage){
                            if (responseMessage instanceof CommunicationResponseMessage) {
                                await responseMessage.validate();
                                if (communicationStatus.isSuccess(responseMessage.status) && !hasSelectedHeaders) {
                                    if (communicationStatus.getStatusCode(responseMessage.status) === 201) {
                                        this.response.statusCode = responseMessage.statusCode;
                                        this.response.statusMessage = responseMessage.statusMessage;
                                        this.response.headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                    if (communicationStatus.getStatusCode(responseMessage.status) === 200) {
                                        this.response.statusCode = responseMessage.statusCode;
                                        this.response.statusMessage = responseMessage.statusMessage;
                                        this.response.headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                }
                                if (communicationStatus.isFail(responseMessage.status) && !hasSelectedHeaders) {
                                    if (communicationStatus.getStatusCode(responseMessage.status) === 400) {
                                        this.response.statusCode = responseMessage.statusCode;
                                        this.response.statusMessage = responseMessage.statusMessage;
                                        this.response.headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                    if (communicationStatus.getStatusCode(responseMessage.status) === 401) {
                                        this.response.statusCode = responseMessage.statusCode;
                                        this.response.statusMessage = responseMessage.statusMessage;
                                        this.response.headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                    if (communicationStatus.getStatusCode(responseMessage.status) === 500) {
                                        this.response.statusCode = responseMessage.statusCode;
                                        this.response.statusMessage = responseMessage.statusMessage;
                                        this.response.headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                }
                                if (hasSelectedHeaders) {
                                    bodyCollate.push(responseMessage.toString());
                                }
                                this.response.body = utils.getJSONString(bodyCollate);
                            }
                        }
                    };
                } else {
                    this.response.statusCode = 500;
                    this.response.statusMessage = communicationStatus.getStatusMessage(500);
                    this.response.headers = {};
                    this.response.body = "no results from one or more callbacks";
                }
            } catch (err) {
                logging.write("component.communication.requesthandler",`error message: ${err.message}, error stack: ${err.stack}`);    
            }
        }
    }});
};
module.exports = { RequestHandler };