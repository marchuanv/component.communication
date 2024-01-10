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
    get headers() {
        return super.get({ headers: null }, Object.prototype);
    }
    set headers(value) {
        super.set({ headers: value });
    }
    get data() {
        return super.get({ data: null }, Object.prototype);
    }
    set data(value) {
        super.set({ data: value });
    }
}