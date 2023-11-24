import { CtorParam, MessageSchema, Properties, randomUUID } from '../registry.mjs';
export class Connection extends Properties {
    /**
     * @param { HttpConnection } connection
     * @param { MessageSchema } messageSchema
    */
    constructor(connection, messageSchema) {
        super([
            new CtorParam('connection', connection, true, true, true),
            new CtorParam('messageSchema', messageSchema, true, true, false)
        ]);
        super.set({ Id: randomUUID() }, true, true);
    }
    /**
     * @param { { headers: Object, body: { Id: String, data: String } } } message
     * @returns {{ Id: String, data: String }}
    */
    async send(message) {
        const connection = super.get({ connection: null }, Connection.prototype);
        const messageSchema = super.get({ messageSchema: null }, MessageSchema.prototype);
        await messageSchema.validate(message);
        connection.send(message);
    }
    /**
      * @returns { { clientMessage: { headers: Object, body: { Id: String, data: String } }, serverMessage: { headers: Object, body: { Id: String, data: String } } } }
    */
    receive() {
        const connection = super.get({ connection: null }, Connection.prototype);
        const messageSchema = super.get({ messageSchema: null }, MessageSchema.prototype);
        connection.open();
        return new Promise((resolve, reject) => {
            const _receive = () => {
                connection.receive().then(async (message) => {
                    try {
                        if (message) {
                            await messageSchema.validate(message);
                            resolve({ serverMessage });
                        } else {
                            setTimeout(_receive, 100);
                        }
                    } catch(error) {
                        reject(error);
                    }
                }).catch(reject);
            };
            _receive();
        });
    }
}