import { Connection, ConnectionOptions } from '../lib/registry.mjs';
const suite = describe('when creating a connection given successful', () => {
    it('should send multiple messages and receive multiple messages', (done) => {
        const connectionOptions = new ConnectionOptions(3, 10000, 'localhost', 8080, 'localhost', 8080);
        const connection = new Connection(connectionOptions);
        const message1Id = 'ca064ae2-dc0c-40ea-ae95-a83934e32bfc';
        const message1ClientData = 'Hello World';
        const message1ServerData = 'message received and is valid';
        const message1 = {
            headers: {},
            body: {
                Id: message1Id,
                data: message1ClientData
            }
        };
        const expectedClientMessage1 = {
            headers: {},
            body: {
                Id: message1Id,
                data: message1ClientData
            }
        };
        const expectedServerMessage1 = {
            headers: {},
            body: {
                Id: message1Id,
                data: message1ServerData
            }
        };
        const message2Id = '6c0e1b03-ca39-483f-9e93-3c6077626dda';
        const message2ClientData = 'Hello World';
        const message2ServerData = 'message received and is valid';
        const message2 = {
            headers: {},
            body: {
                Id: message2Id,
                data: message2ClientData
            }
        };
        const expectedClientMessage2 = {
            headers: {},
            body: {
                Id: message2Id,
                data: message2ClientData
            }
        };
        const expectedServerMessage2 = {
            headers: {},
            body: {
                Id: message2Id,
                data: message2ServerData
            }
        };
        let count = 1;
        const _sendReceive = () => {
            let messageToSend = message1;
            let expectedClientMessage = expectedClientMessage1;
            let expectedServerMessage = expectedServerMessage1;
            if (count > 1) {
                messageToSend = message2;
                expectedClientMessage = expectedClientMessage2;
                expectedServerMessage = expectedServerMessage2;
            }
            connection.receive().then(({ clientMessage, serverMessage }) => {
                if (clientMessage) {
                    expect(JSON.stringify(clientMessage.body)).toBe(JSON.stringify(expectedServerMessage.body));
                } else if (serverMessage) {
                    expect(JSON.stringify(serverMessage.body)).toBe(JSON.stringify(expectedClientMessage.body));
                }
                if (count === 2) {
                    done();
                } else {
                    count = count + 1;
                    setTimeout(_sendReceive, 1000);
                }
            }).catch((error) => {
                fail(error);
                done();
            });
            connection.send(messageToSend);
        };
        _sendReceive();
    });
});
process.specs.set(suite, []);