function CommunicationStatus() {};
Communication.prototype.getStatus = function(statusCode) {
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
Communication.prototype.getStatusMessage = function(status) {
    if (status.indexOf("Fail") > -1 ) {
        if (status.indexOf("BadRequest") > -1 ) {
            return "Bad Request";
        }
        if (status.indexOf("Unauthorised") > -1 ) {
            return "Unauthorised";
        }
        if (status.indexOf("Error") > -1 ) {
            return "Internal Server Error";
        }
    }
    if (status.indexOf("Success") > -1 ) {
        if (status.indexOf("Created") > -1 ) {
            return "Created";
        } else {
            return "Success";
        }
    }
};
Communication.prototype.getStatusCode = function(status) {
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
module.exports = CommunicationStatus;