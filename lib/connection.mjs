import { ConnectionOptions, HttpConnection, Properties } from './registry.mjs';
export class Connection extends Properties {
    /**
     * @param { ConnectionOptions} connectionOptions
    */
    constructor(connectionOptions) {
        super();
        const httpConnection = new HttpConnection(connectionOptions);
        super.set('connection', httpConnection);
    }
    /**
     * @param { { headers: Object, body: { Id: String, data: String } } } message
     * @returns {{ Id: String, data: String }}
    */
    async send(message) {
        const connection = super.get('connection');
        connection.send(message);
    }
    /**
      * @returns { { clientMessage: { headers: Object, body: { Id: String, data: String } }, serverMessage: { headers: Object, body: { Id: String, data: String } } } }
    */
    receive() {
        const connection = super.get('connection', Connection.prototype);
        return new Promise((resolve, reject) => {
            const promises = connection.receive();
            Promise.all(promises).then(([clientMessage, serverMessage, errorMessage]) => {
                if (errorMessage) {
                    reject(errorMessage);
                } else {
                    resolve({ clientMessage, serverMessage });
                }
            }).catch(reject);
            connection.open();
        });
    }
}