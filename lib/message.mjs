import { Model } from '../registry.mjs';
export class Message extends Model {
    constructor() {
        super();
        super.set({ headers: {} });
        super.set({ data: null });
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