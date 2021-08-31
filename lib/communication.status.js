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
    const _statusStr = status.toString();
    if (_statusStr.indexOf("Fail") > -1 || parseInt(status)) {
        if (_statusStr.indexOf("BadRequest") > -1 || status === 400 ) {
            return "Bad Request";
        }
        if (_statusStr.indexOf("Unauthorised") > -1 || status === 401 ) {
            return "Unauthorised";
        }
        if (_statusStr.indexOf("Error") > -1 || status === 500 ) {
            return "Internal Server Error";
        }
    }
    if (_statusStr.indexOf("Success") > -1 || parseInt(status)) {
        if (_statusStr.indexOf("Created") > -1 || status === 201 ) {
            return "Created";
        } else {
            return "Success";
        }
    }
};
CommunicationStatus.prototype.getStatusCode = function(status) {
    const _statusStr = status.toString();
    if (_statusStr.indexOf("Fail") > -1 ) {
        if (_statusStr.indexOf("BadRequest") > -1 ) {
            return 400;
        }
        if (_statusStr.indexOf("Unauthorised") > -1 ) {
            return 401;
        }
        if (_statusStr.indexOf("Error") > -1 ) {
            return 500;
        }
    }
    if (_statusStr.indexOf("Success") > -1 ) {
        if (_statusStr.indexOf("Created") > -1 ) {
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