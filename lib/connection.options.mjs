import { GUID, MemberParameter, Model } from '../registry.mjs';
export class ConnectionOptions extends Model {
    /**
     * @param { GUID } Id
     * @param { Number } maxRetryCount
     * @param { Number } timeoutMilli
     * @param { String } hostName
     * @param { Number } hostPort
     * @param { String } remoteHostName
     * @param { Number } remoteHostPort
     */
    constructor(Id, maxRetryCount, timeoutMilli, hostName, hostPort, remoteHostName, remoteHostPort) {
        super([
            new MemberParameter( { Id }),
            new MemberParameter( { maxRetryCount }),
            new MemberParameter( { timeoutMilli }),
            new MemberParameter( { hostName }),
            new MemberParameter( { hostPort }),
            new MemberParameter( { remoteHostName }),
            new MemberParameter( { remoteHostPort })
        ]);
    }
    /**
     * @returns { String }
    */
    get hostName() {
        return super.get({ hostName: null });
    }
    /**
     * @returns { Number }
    */
    get hostPort() {
        return super.get({ hostPort: null });
    }
    /**
     * @returns { String }
    */
    get remoteHostName() {
        return super.get({ remoteHostName: null });
    }
    /**
     * @returns { Number }
    */
    get remoteHostPort() {
        return super.get({ remoteHostPort: null });
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
    /**
     * @returns { ConnectionOptions }
    */
    static ctor() {

    }
}