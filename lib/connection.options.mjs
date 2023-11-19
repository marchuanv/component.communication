import { Properties } from '../registry.mjs';
export class ConnectionOptions extends Properties {
    /**
     * @param { Number } maxRetryCount
     * @param { Number } timeoutMilli
     * @param { String } hostName
     * @param { Number } hostPort
     * @param { String } remoteHostName
     * @param { Number } remoteHostPort
     */
    constructor(maxRetryCount, timeoutMilli, hostName, hostPort, remoteHostName, remoteHostPort) {
        super();
        super.set('maxRetryCount', maxRetryCount || 3, true, false);
        super.set('timeoutMilli', timeoutMilli || 60000, true, false);
        super.set('host', hostName, true, true);
        super.set('port', hostPort, true, true);
        super.set('remoteHost', remoteHostName, true, true);
        super.set('remotePort', remoteHostPort, true, true);
    }
    /**
     * @returns { String }
    */
    get host() {
        return super.get('host');
    }
    /**
     * @returns { Number }
    */
    get port() {
        return super.get('port');
    }
    /**
     * @returns { String }
    */
    get remoteHost() {
        return super.get('remoteHost');
    }
    /**
     * @returns { Number }
    */
    get remotePort() {
        return super.get('remotePort');
    }
    /**
     * @returns { Number }
    */
    get maxRetryCount() {
        return super.get('maxRetryCount');
    }
    /**
     * @returns { Number }
    */
    get timeoutMilli() {
        return super.get('timeoutMilli');
    }
}