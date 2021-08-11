function CommunicationStatus() {};
CommunicationStatus.prototype.getStatus = function(statusCode) {
    if (statusCode === 200) {
        return "Success";
    }
    if (statusCode === 201 ) {
        return "Success_Created";
    }
    if (statusCode === 400) {
        return "Fail_BadRequest";
    }
    if (statusCode === 401) {
        return "Fail_Unauthorised";
    }
    if (statusCode === 500) {
        return "Fail_Error";
    }
};
CommunicationStatus.prototype.getStatusMessage = function(status) {
    if (status.indexOf("Fail") > -1 || parseInt(status)) {
        if (status.indexOf("BadRequest") > -1 || status === 400 ) {
            return "Bad Request";
        }
        if (status.indexOf("Unauthorised") > -1 || status === 401 ) {
            return "Unauthorised";
        }
        if (status.indexOf("Error") > -1 || status === 500 ) {
            return "Internal Server Error";
        }
    }
    if (status.indexOf("Success") > -1 || parseInt(status)) {
        if (status.indexOf("Created") > -1 || status === 201 ) {
            return "Created";
        } else {
            return "Success";
        }
    }
};
CommunicationStatus.prototype.getStatusCode = function(status) {
    if (status.indexOf("Fail") > -1 ) {
        if (status.indexOf("BadRequest") > -1 ) {
            return 400;
        }
        if (status.indexOf("Unauthorised") > -1 ) {
            return 401;
        }
        if (status.indexOf("Error") > -1 ) {
            return 500;
        }
    }
    if (status.indexOf("Success") > -1 ) {
        if (status.indexOf("Created") > -1 ) {
            return 201;
        } else {
            return 200;
        }
    }
};
CommunicationStatus.prototype.isSuccess = function(status) {
    return status.indexOf("Success") > -1;
};
CommunicationStatus.prototype.isFail = function(status) {
    return status.indexOf("Fail") > -1;
};
module.exports = CommunicationStatus;