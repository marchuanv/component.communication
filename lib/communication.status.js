const mapping = {
    Success: { statusCode: 200, statusMessage: "Success" },
    Deferred: { statusCode: 201, statusMessage: "Created" },
    BadRequest: { statusCode: 400, statusMessage: "Bad Request" },
    Unauthorised: { statusCode: 401, statusMessage: "Unauthorised" },
    Error: { statusCode: 500, statusMessage: "Internal Server Error" },
};
for(const prop in mapping) {
    mapping[mapping[prop].statusCode] = prop;
};
module.exports = mapping;