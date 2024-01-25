import { Container, CtorArgs } from '../registry.mjs';
export class ConnectionOptionsCtorArgs extends CtorArgs {
    /**
     * @return { Number }
    */
    get maxRetryCount() {
        return super.get({ maxRetryCount: null });
    }
    /**
     * @param { Number } value
    */
    set maxRetryCount(value) {
        super.set({ maxRetryCount: value });
    }

    /**
     * @return { Number }
    */
    get timeoutMilli() {
        return super.get({ timeoutMilli: null });
    }
    /**
     * @param { Number } value
    */
    set timeoutMilli(value) {
        super.set({ timeoutMilli: value });
    }

    /**
     * @return { String }
    */
    get hostName() {
        return super.get({ hostName: null });
    }
    /**
     * @param { String } value
    */
    set hostName(value) {
        super.set({ hostName: value });
    }

    /**
     * @return { Number }
    */
    get hostPort() {
        return super.get({ hostPort: null });
    }
    /**
     * @param { Number } value
    */
    set hostPort(value) {
        super.set({ hostPort: value });
    }

    /**
     * @return { String }
    */
    get remoteHostName() {
        return super.get({ remoteHostName: null });
    }
    /**
     * @param { String } value
    */
    set remoteHostName(value) {
        super.set({ remoteHostName: value });
    }

    /**
     * @return { Number }
    */
    get remoteHostPort() {
        return super.get({ remoteHostPort: null });
    }
    /**
     * @param { Number } value
    */
    set remoteHostPort(value) {
        super.set({ remoteHostPort: value });
    }
}
export class ConnectionOptions extends Container {
    /**
     * @param { ConnectionOptionsCtorArgs } ctorArgs
     */
    constructor(ctorArgs) {
        super(ctorArgs);
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
}