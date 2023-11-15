import { ConnectionOptions, HttpConnection } from './registry.mjs';
export class Connection {
    /**
     * @param { ConnectionOptions} connectionOptions
    */
    constructor(connectionOptions) {
        this._connection = new HttpConnection(connectionOptions);
    }
    /**
     * @param { { headers: Array<String>, body: { Id: String, data: String } } } message
     * @returns {{ Id: String, data: String }}
    */
    async send(message) {
        return await this._connection.send(message);
    }
    /**
     * @returns { Boolean }
    */
    async open() {
        try {
            await this._connection.open();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}