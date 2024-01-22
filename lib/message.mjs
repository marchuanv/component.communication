import { MemberParameter, Model } from '../registry.mjs';
export class Message extends Model {
    /**
     * @param { Object } data
     */
    constructor(data) {
        super([
            new MemberParameter({ data })
        ]);
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