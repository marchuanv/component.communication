import { MessageHeadersCtorArgs } from "../lib/message.headers.mjs";
import { Connection, ConnectionCtorArgs, ConnectionOptions, ConnectionOptionsCtorArgs, HttpConnection, HttpConnectionCtorArgs, Message, MessageCtorArgs, MessageHeaders, MessagePriority } from "../registry.mjs";

describe('when sending multiple messages given a connection was created', () => {
    it('should send and receive multiple messages', async () => {

        const connectionOptionsArgs = new ConnectionOptionsCtorArgs();
        connectionOptionsArgs.maxRetryCount = 3;
        connectionOptionsArgs.timeoutMilli = 10000;
        connectionOptionsArgs.hostName = 'localhost';
        connectionOptionsArgs.hostPort = 8080;
        connectionOptionsArgs.remoteHostName = 'localhost';
        connectionOptionsArgs.remoteHostPort = 8080;

        const message1ClientData = 'Hello World';
        const message1ServerData = 'message received and is valid';

        const message1HeadersCtorArgs = new MessageHeadersCtorArgs();
        message1HeadersCtorArgs.clienthost = connectionOptionsArgs.hostName;
        message1HeadersCtorArgs.clientport = connectionOptionsArgs.hostPort;
        message1HeadersCtorArgs.priority = MessagePriority.High;
        message1HeadersCtorArgs.time = 10;
        const message1Headers = new MessageHeaders(message1HeadersCtorArgs);

        const message1CtorArgs = new MessageCtorArgs();
        message1CtorArgs.clienthost = connectionOptionsArgs.hostName;
        message1CtorArgs.clientport = connectionOptionsArgs.hostPort;
        message1CtorArgs.headers = message1Headers;
        message1CtorArgs.priority = message1Headers.priority;
        message1CtorArgs.data = message1ClientData;
        message1CtorArgs.time = message1HeadersCtorArgs.time;

        const message1 = new Message(message1CtorArgs);

        const expectedRequestMessage1 = {
            headers: { identifier: message1.headers.identifier },
            data: message1ClientData
        };
        const expectedResponseMessage1 = {
            headers: { identifier: message1.headers.identifier },
            data: message1ServerData
        };

        const message2ClientData = 'Hello World Again';
        const message2ServerData = 'message received and is valid';

        const message2HeadersCtorArgs = new MessageHeadersCtorArgs();
        message2HeadersCtorArgs.clienthost = connectionOptionsArgs.hostName;
        message2HeadersCtorArgs.clientport = connectionOptionsArgs.hostPort;
        message2HeadersCtorArgs.priority = MessagePriority.Medium;
        message2HeadersCtorArgs.time = 20;
        const message2Headers = new MessageHeaders(message2HeadersCtorArgs);

        const message2CtorArgs = new MessageCtorArgs();
        message2CtorArgs.clienthost = connectionOptionsArgs.hostName;
        message2CtorArgs.clientport = connectionOptionsArgs.hostPort;
        message2CtorArgs.headers = message2Headers;
        message2CtorArgs.priority = message2Headers.priority;
        message2CtorArgs.data = message2ClientData;
        message2CtorArgs.time = message2HeadersCtorArgs.time;

        const message2 = new Message(message2CtorArgs);

        const expectedRequestMessage2 = {
            headers: { identifier: message2.headers.identifier },
            data: message2ClientData
        };
        const expectedResponseMessage2 = {
            headers: { identifier: message2.headers.identifier },
            data: message2ServerData
        };
        let count = 0;

        const connectionOptions = new ConnectionOptions(connectionOptionsArgs);

        const httpConnectionArgs = new HttpConnectionCtorArgs();
        httpConnectionArgs.connectionOptions = connectionOptions;
        const httpConnection = new HttpConnection(httpConnectionArgs);

        const connectionArgs = new ConnectionCtorArgs();
        connectionArgs.connection = httpConnection;
        connectionArgs.connectionOptions = connectionOptions;
        const connection = new Connection(connectionArgs);

        const promise = new Promise((resolve, reject) => {
            connection.receive().then((message) => {
                count = count + 1;
                const { requestid, responseid } = message.headers;
                const isClientSide = (requestid === responseid) ? true : false;
                if (isClientSide) {
                    throw new Error('expected server message');
                }
                expect(JSON.stringify(message.data)).toBe(JSON.stringify(expectedRequestMessage1.data));
            }).catch(reject);
            connection.receive().then((message) => {
                count = count + 1;
                const { requestid, responseid } = message.headers;
                const isClientSide = (requestid === responseid) ? true : false;
                if (isClientSide) {
                    throw new Error('expected server message');
                }
                expect(JSON.stringify(message.data)).toBe(JSON.stringify(expectedRequestMessage2.data));
            }).catch(reject);
            connection.receive().then((message) => {
                count = count + 1;
                const { requestid, responseid } = message.headers;
                const isClientSide = (requestid === responseid) ? true : false;
                if (!isClientSide) {
                    throw new Error('expected client message');
                }
                expect(JSON.stringify(message.data)).toBe(JSON.stringify(expectedResponseMessage1.data));
            }).catch(reject);
            connection.receive().then((message) => {
                count = count + 1;
                const { requestid, responseid } = message.headers;
                const isClientSide = (requestid === responseid) ? true : false;
                if (!isClientSide) {
                    throw new Error('expected client message');
                }
                expect(JSON.stringify(message.data)).toBe(JSON.stringify(expectedResponseMessage2.data));
                if (count === 4) {
                    resolve();
                }
            }).catch(reject);
            connection.send(message1);
            connection.send(message2);
        });
        await promise;
    });
});