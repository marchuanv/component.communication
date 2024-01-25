import {
    Container,
    CtorArgs,
    MessageHeaders
} from '../registry.mjs';
export class MessageCtorArgs extends CtorArgs {
    /**
     * @returns { Object }
    */
    get data() {
        return super.get({ data: null });
    }
    /**
     * @param { Object } value
    */
    set data(value) {
        super.set({ data: value });
    }
    /**
     * @returns { MessageHeaders }
    */
    get headers() {
        return super.get({ headers: null });
    }
    /**
     * @param { MessageHeaders } value
    */
    set headers(value) {
        super.set({ headers: value });
    }
}
export class Message extends Container {
    /**
     * @param { MessageCtorArgs } ctorArgs
    */
    constructor(ctorArgs) {
        super(ctorArgs);
    }
    /**
     * @returns { MessageHeaders }
    */
    get headers() {
        return super.get({ headers: null });
    }
    /**
     * @returns { Object }
    */
    get data() {
        return super.get({ data: null });
    }
}