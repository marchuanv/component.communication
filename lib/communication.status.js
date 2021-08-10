function CommunicationStatus() {
    this.Success =  [{ statusCode: 200, statusMessage: "Success" },
                     { statusCode: 201, statusMessage: "Created" }];
    this.Fail =     [{ statusCode: 400, statusMessage: "Bad Request" },
                     { statusCode: 401, statusMessage: "Unauthorised" },
                     { statusCode: 500, statusMessage: "Internal Server Error" }];
    for(const prop in this) {
        for(const entry of this[prop]) {
            this[entry.statusCode] = prop;    
        }
    };
};
Communication.prototype.getStatus = function(statusCode) {

};
Communication.prototype.getStatusCode = function(status) {

};
Communication.prototype.getStatusMessage = function(status) {

};
module.exports = CommunicationStatus;