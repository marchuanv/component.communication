import { ConnectionOptions, GUID, MemberParameter, Model } from '../registry.mjs';
export class Connection extends Model {
    /**
     * @param { GUID } Id
     * @param { HttpConnection } connection
    */
    constructor(Id, connection) {
        super([
            new MemberParameter( { Id }),
            new MemberParameter( { connection })
        ]);
    }
    /**
     * @param { { headers: Object, data: Object } } message
    */
    async send(message) {
        const connection = super.get({ connection: null }, Connection.prototype);
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
     * @returns { { headers: Object, data: Object } }
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
    /**
     * @returns { Connection }
    */
    static ctor() {

    }
}