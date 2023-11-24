import { ConnectionOptions, CtorParam, MessageSchema, Properties, general, randomUUID } from '../registry.mjs';
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
     * @param { { headers: Object, data: Object } } message
    */
    async send(message) {
        const connection = super.get({ connection: null }, Connection.prototype);
        const connectionOptions = connection.get( { connectionOptions: null }, ConnectionOptions.prototype);
        const { remoteHost, remotePort, host, port } = connectionOptions;
        const clientId = super.get({ Id: null }, String.prototype);
        message.headers.connection = {
            clientId,
            clienthost: host,
            clientport: port,
            serverhost: remoteHost,
            serverport: remotePort
        };
        const messageSchema = super.get({ messageSchema: null }, MessageSchema.prototype);
        await messageSchema.validate(message);
        const connStr = JSON.stringify(message.headers.connection);
        message.headers.connection = general.stringToBase64(connStr);
        connection.send(message);
    }
    /**
     * @returns { { headers: Object, data: Object } }
    */
    receive() {
        const clientId = super.get({ Id: null }, String.prototype);
        const connection = super.get({ connection: null }, Connection.prototype);
        const messageSchema = super.get({ messageSchema: null }, MessageSchema.prototype);
        const connectionOptions = connection.get( { connectionOptions: null }, ConnectionOptions.prototype);
        const { host, port } = connectionOptions;
        connection.open();
        return new Promise((resolve, reject) => {
            const _receive = () => {
                connection.receive().then(async (message) => {
                    try {
                        if (message) {
                            const base64ConStr = general.base64ToString(message.headers.connection);
                            message.headers.connection = JSON.parse(base64ConStr);
                            const { serverhost, serverport } = message.headers.connection;
                            await messageSchema.validate(message);
                            if (serverhost === host && serverport === port) {
                                resolve(message);
                            } else {
                                console.error('received message was not meant for this connection');
                            }
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