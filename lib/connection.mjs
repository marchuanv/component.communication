import { CtorParam, Properties, randomUUID } from '../registry.mjs';
export class Connection extends Properties {
    /**
     * @param { HttpConnection } connection
    */
    constructor(connection) {
        super([new CtorParam('connection', connection, true, true, true)]);
        super.set({ Id: randomUUID() }, true, true);
    }
    /**
     * @param { { headers: Object, body: { Id: String, data: String } } } message
     * @returns {{ Id: String, data: String }}
    */
    async send(message) {
        const connection = super.get({ connection: null }, Connection.prototype);
        connection.send(message);
    }
    /**
      * @returns { { clientMessage: { headers: Object, body: { Id: String, data: String } }, serverMessage: { headers: Object, body: { Id: String, data: String } } } }
    */
    receive() {
        const connection = super.get({ connection: null }, Connection.prototype);
        connection.open();
        return new Promise((resolve, reject) => {
            const _receive = () => {
                const promises = connection.receive();
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