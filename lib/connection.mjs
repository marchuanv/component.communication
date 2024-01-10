import { ConnectionOptions, GUID, MemberParameter, Message, Model } from '../registry.mjs';
export class Connection extends Model {
    /**
     * @param { GUID } Id
     * @param { HttpConnection } con
    */
    constructor(Id, con) {
        super([
            new MemberParameter( { Id }),
            new MemberParameter( { con })
        ]);
    }
    /**
     * @param { Message } message
    */
    async send(message) {
        const connection = super.get({ con: null }, Connection.prototype);
        const connectionOptions = connection.get( { connectionOptions: null }, ConnectionOptions.prototype);
        const { host, port } = connectionOptions;
        message.headers.requestid = new GUID();
        message.headers.responseid = new GUID();
        message.headers.clienthost = host;
        message.headers.clientport = port;
        const messageSchema = super.get({ messageSchema: null }, MessageSchema.prototype);
        await messageSchema.validate(message);
        connection.send(message);
    }
    /**
     * @returns { Message }
    */
    receive() {
        const connection = super.get({ con: null }, Connection.prototype);
        const messageSchema = super.get({ messageSchema: null }, MessageSchema.prototype);
        connection.open();
        return new Promise((resolve, reject) => {
            const _receive = () => {
                connection.receive().then(async (message) => {
                    try {
                        if (message) {
                            await messageSchema.validate(message);
                            resolve(message);
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