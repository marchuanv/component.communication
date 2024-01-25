
import {
    Container,
    CtorArgs,
    GUID,
    MessagePriority
} from '../registry.mjs';
export class MessageHeadersCtorArgs extends CtorArgs {
    /**
     * @returns { MessagePriority }
    */
    get priority() {
        return super.get({ priority: null });
    }
    /**
     * @param { MessagePriority }
    */
    set priority(value) {
        super.set({ priority: value });
    }
    /**
     * @returns { Number }
    */
    get time() {
        return super.get({ time: null });
    }
    /**
     * @param { Number }
    */
    set time(value) {
        super.set({ time: value });
    }
    /**
     * @returns { String }
    */
    get clienthost() {
        return super.get({ clienthost: null });
    }
    /**
     * @param { String } value
    */
    set clienthost(value) {
        super.set({ clienthost: value });
    }
    /**
     * @returns { Number }
    */
    get clientport() {
        return super.get({ clientport: null });
    }
    /**
     * @param { Number } value
    */
    set clientport(value) {
        super.set({ clientport: value });
    }
}
export class MessageHeaders extends Container {
    /**
     * @param { MessageHeadersCtorArgs } ctorArgs
    */
    constructor(ctorArgs) {
        super(ctorArgs);
        const identifier = new GUID();
        const requestid = new GUID();
        const responseid = new GUID();
        super.set({ identifier });
        super.set({ requestid });
        super.set({ responseid });
    }
    /**
     * @returns { String }
    */
    get identifier() {
        return super.get({ identifier: null });
    }
    /**
     * @returns { String }
    */
    get requestid() {
        return super.get({ requestid: null });
    }
    /**
     * @returns { String }
    */
    get responseid() {
        return super.get({ responseid: null });
    }
    /**
     * @returns { Number }
    */
    get priority() {
        return super.get({ priority: null });
    }
    /**
     * @returns { Number }
    */
    get time() {
        return super.get({ time: null });
    }
    /**
     * @returns { String }
    */
    get clienthost() {
        return super.get({ clienthost: null });
    }
    /**
     * @returns { Number }
    */
    get clientport() {
        return super.get({ clientport: null });
    }
}