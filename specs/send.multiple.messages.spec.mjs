import { Connection, ConnectionOptions, GUID, HttpConnection, Message } from "../registry.mjs";

describe('when sending multiple messages given a connection was created', () => {
    it('should send and receive multiple messages', async () => {

        let identifier = 'ca064ae2-dc0c-40ea-ae95-a83934e32bfc';
        const message1ClientData = 'Hello World';
        const message1ServerData = 'message received and is valid';

        const message1 = new Message(message1ClientData);
        message1.headers = { identifier };

        const expectedRequestMessage1 = {
            headers: { identifier },
            data: message1ClientData
        };
        const expectedResponseMessage1 = {
            headers: { identifier },
            data: message1ServerData
        };
        identifier = '6c0e1b03-ca39-483f-9e93-3c6077626dda';
        const message2ClientData = 'Hello World Again';
        const message2ServerData = 'message received and is valid';

        const message2 = new Message(message2ClientData);
        message2.headers = { identifier };

        const expectedRequestMessage2 = {
            headers: { identifier },
            data: message2ClientData
        };
        const expectedResponseMessage2 = {
            headers: { identifier },
            data: message2ServerData
        };
        let count = 0;
        const connectionOptions = new ConnectionOptions(new GUID(), 3, 10000, 'localhost', 8080, 'localhost', 8080);
        const httpConnection = new HttpConnection(new GUID(), connectionOptions);
        const connection = new Connection(new GUID(), httpConnection);
        const promise = new Promise((resolve, reject) => {
            connection.receive().then((message) => {
                count = count + 1;
                const { requestid, responseid } = message.headers;
                const isClientSide = (requestid === responseid) ? true: false;
                if (isClientSide) {
                    throw new Error('expected server message');
                }
                expect(JSON.stringify(message.data)).toBe(JSON.stringify(expectedRequestMessage1.data));
            }).catch(reject);
            connection.receive().then((message) => {
                count = count + 1;
                const { requestid, responseid } = message.headers;
                const isClientSide = (requestid === responseid) ? true: false;
                if (isClientSide) {
                    throw new Error('expected server message');
                }
                expect(JSON.stringify(message.data)).toBe(JSON.stringify(expectedRequestMessage2.data));
            }).catch(reject);
            connection.receive().then((message) => {
                count = count + 1;
                const { requestid, responseid } = message.headers;
                const isClientSide = (requestid === responseid) ? true: false;
                if (!isClientSide) {
                    throw new Error('expected client message');
                }
                expect(JSON.stringify(message.data)).toBe(JSON.stringify(expectedResponseMessage1.data));
            }).catch(reject);
            connection.receive().then((message) => {
                count = count + 1;
                const { requestid, responseid } = message.headers;
                const isClientSide = (requestid === responseid) ? true: false;
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