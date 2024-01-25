import { Container, CtorArgs } from '../registry.mjs';
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
}
export class Message extends Container {
    /**
     * @param { MessageCtorArgs } ctorArgs
     */
    constructor(ctorArgs) {
        super(ctorArgs);
        super.set({ headers: {} });
    }
    /**
     * @returns { Object }
    */
    get headers() {
        return super.get({ headers: null }, Object.prototype);
    }
    /**
     * @param { Object } value
    */
    set headers(value) {
        super.set({ headers: value });
    }
    /**
     * @returns { Object }
    */
    get data() {
        return super.get({ data: null }, Object.prototype);
    }
    /**
     * @param { Object } value
    */
    set data(value) {
        super.set({ data: value });
    }
}