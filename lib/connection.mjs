
import {
    ConnectionOptions,
    Container,
    CtorArgs,
    GUID,
    HttpConnection,
    Message
} from '../registry.mjs';
export class ConnectionCtorArgs extends CtorArgs {
    /**
     * @return { HttpConnection }
    */
    get connection() {
        return super.get({ connection: null });
    }
    /**
     * @param { HttpConnection } value
    */
    set connection(value) {
        super.set({ connection: value });
    }
    /**
     * @return { ConnectionOptions }
    */
    get connectionOptions() {
        return super.get({ connectionOptions: null });
    }
    /**
     * @param { ConnectionOptions } value
    */
    set connectionOptions(value) {
        super.set({ connectionOptions: value });
    }
}
export class Connection extends Container {
    /**
     * @param { ConnectionCtorArgs } ctorArgs
    */
    constructor(ctorArgs) {
        super(ctorArgs);
    }
    /**
     * @param { Message } message
    */
    async send(message) {
        const connection = super.get({ connection: null }, Connection.prototype);
        const connectionOptions = super.get({ connectionOptions: null }, ConnectionOptions.prototype);
        const { hostName, hostPort } = connectionOptions;
        message.headers.requestid = new GUID();
        message.headers.responseid = new GUID();
        message.headers.clienthost = hostName;
        message.headers.clientport = hostPort;
        connection.send(message);
    }
    /**
     * @returns { Message }
    */
    receive() {
        const connection = super.get({ connection: null }, Connection.prototype);
        connection.open();
        return new Promise((resolve, reject) => {
            const _receive = () => {
                connection.receive().then(async (message) => {
                    try {
                        if (message) {
                            resolve(message);
                        } else {
                            setTimeout(_receive, 100);
                        }
                    } catch (error) {
                        reject(error);
                    }
                }).catch(reject);
            };
            _receive();
        });
    }
}