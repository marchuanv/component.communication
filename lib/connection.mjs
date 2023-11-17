import { ConnectionOptions, HttpConnection, Properties } from './registry.mjs';
export class Connection extends Properties {
    /**
     * @param { ConnectionOptions} connectionOptions
    */
    constructor(connectionOptions) {
        super(connectionOptions);
        if (!super.get('httpConnection')) {
            const httpConnection = new HttpConnection(connectionOptions);
            super.set('httpConnection', httpConnection);
        }
    }
    /**
     * @param { { headers: Object, body: { Id: String, data: String } } } message
     * @returns {{ Id: String, data: String }}
    */
    async send(message) {
        const httpConnection = super.get('httpConnection');
        httpConnection.send(message);
    }
    /**
      * @returns { { clientMessage: { headers: Object, body: { Id: String, data: String } }, serverMessage: { headers: Object, body: { Id: String, data: String } } } }
    */
    receive() {
        const httpConnection = super.get('httpConnection', Connection.prototype);
        httpConnection.open();
        return new Promise((resolve, reject) => {
            const _receive = () => {
                const promises = httpConnection.receive();
                Promise.all(promises).then(([clientMessage, serverMessage]) => {
                    if (clientMessage || serverMessage) {
                        resolve({ clientMessage, serverMessage });
                    } else {
                        setTimeout(_receive, 100);
                    }
                }).catch(reject);
            };
            _receive();
        });
    }
}