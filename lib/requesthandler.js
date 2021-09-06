const { Logger } = require("component.logging");
const { MessageStatus } = require("./messagestatus.js");
const { RequestMessage } = require("./requestmessage.js");

const logging = new Logger({ componentName: "Communication Connection Requesthandler" });
const messageStatus = new MessageStatus();


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
        statusMessage: messageStatus.getMessage(500),
        headers: {},
        body: messageStatus.getMessage(500)
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
            this.response.statusMessage = messageStatus.getMessage(response.statusCode);
            this.response.headers = defaultHeaders;
        } else {
            const incomingMessage = new RequestMessage({ Id: url.replace("/",""), headers: requestHeaders, body: requestBody });
            let bodyCollate = [];
            let hasSelectedHeaders = false;
            try {
                await incomingMessage.validate();
                let responseMessages = await this.callback(incomingMessage);
                if (responseMessages) {
                    if (!Array.isArray(responseMessages)) {
                        logging.write(`more than one response message`);
                        responseMessages = [responseMessages]; 
                    }
                    for(const responseMessage of responseMessages) {
                        if (responseMessage){
                            if (responseMessage instanceof CommunicationResponseMessage) {
                                await responseMessage.validate();
                                if (messageStatus.isSuccess(responseMessage.status) && !hasSelectedHeaders) {
                                    if (messageStatus.getCode(responseMessage.status) === 201) {
                                        this.response.statusCode = responseMessage.statusCode;
                                        this.response.statusMessage = responseMessage.statusMessage;
                                        this.response.headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                    if (messageStatus.getCode(responseMessage.status) === 200) {
                                        this.response.statusCode = responseMessage.statusCode;
                                        this.response.statusMessage = responseMessage.statusMessage;
                                        this.response.headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                }
                                if (messageStatus.isFail(responseMessage.status) && !hasSelectedHeaders) {
                                    if (messageStatus.getCode(responseMessage.status) === 400) {
                                        this.response.statusCode = responseMessage.statusCode;
                                        this.response.statusMessage = responseMessage.statusMessage;
                                        this.response.headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                    if (messageStatus.getCode(responseMessage.status) === 401) {
                                        this.response.statusCode = responseMessage.statusCode;
                                        this.response.statusMessage = responseMessage.statusMessage;
                                        this.response.headers = responseMessage.headers;
                                        hasSelectedHeaders = true;
                                    }
                                    if (messageStatus.getCode(responseMessage.status) === 500) {
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
                    this.response.statusMessage = messageStatus.getMessage(500);
                    this.response.headers = {};
                    this.response.body = "no results from one or more callbacks";
                }
            } catch (err) {
                logging.write(`error message: ${err.message}, error stack: ${err.stack}`);
            }
        }
    }});
};
module.exports = { RequestHandler };