export class ConnectionOptions {
    /**
     * @param { Number } maxRetryCount
     * @param { Number } timeoutMilli
     * @param { String } hostName
     * @param { Number } hostPort
     * @param { String } remoteHostName
     * @param { Number } remoteHostPort
     */
    constructor(maxRetryCount, timeoutMilli, hostName, hostPort, remoteHostName, remoteHostPort) {
        this._maxRetryCount = maxRetryCount || 3;
        this._timeoutMilli = timeoutMilli || 60000;
        this._host = hostName;
        this._port = hostPort;
        this._remoteHost = remoteHostName;
        this._remotePort = remoteHostPort;
    }
    /**
     * @returns { String }
    */
    get host() {
        return this._host;
    }
    /**
     * @returns { Number }
    */
    get port() {
        return this._port;
    }
    /**
     * @returns { String }
    */
    get remoteHost() {
        return this._remoteHost;
    }
    /**
     * @returns { Number }
    */
    get remotePort() {
        return this._remotePort;
    }
    /**
     * @returns { Number }
    */
    get maxRetryCount() {
        return this._maxRetryCount;
    }
    /**
     * @param { Number } value
    */
    set maxRetryCount(value) {
        this._maxRetryCount = value;
    }
    /**
     * @returns { Number }
    */
    get timeoutMilli() {
        return this._timeoutMilli;
    }
    /**
     * @param { Number } value
    */
    set timeoutMilli(value) {
        this._timeoutMilli = value;
    }
}