import { Properties, randomUUID } from '../registry.mjs';
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
        super.set({ Id: randomUUID() }, true, true);
        super.set({ maxRetryCount }, true, false);
        super.set({ timeoutMilli }, true, false);
        super.set({ host: hostName }, true, true);
        super.set({ port: hostPort }, true, true);
        super.set({ remoteHost: remoteHostName }, true, true);
        super.set({ remotePort: remoteHostPort }, true, true);
    }
    /**
     * @returns { String }
    */
    get host() {
        return super.get({ host: null });
    }
    /**
     * @returns { Number }
    */
    get port() {
        return super.get({ port: null });
    }
    /**
     * @returns { String }
    */
    get remoteHost() {
        return super.get({ remoteHost: null });
    }
    /**
     * @returns { Number }
    */
    get remotePort() {
        return super.get({ remotePort: null });
    }
    /**
     * @returns { Number }
    */
    get maxRetryCount() {
        return super.get({ maxRetryCount: null });
    }
    /**
     * @returns { Number }
    */
    get timeoutMilli() {
        return super.get({ timeoutMilli: null });
    }
}