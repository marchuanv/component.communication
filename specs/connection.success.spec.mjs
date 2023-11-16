import { Connection, ConnectionOptions } from '../lib/registry.mjs';
const suite = describe('when creating a connection given successful', () => {
    it('should send a message and receive a success message', (done) => {
        const connectionOptions = new ConnectionOptions(3, 10000, 'localhost', 8080, 'localhost', 8080);
        const connection = new Connection(connectionOptions);
        const messageId = 'ca064ae2-dc0c-40ea-ae95-a83934e32bfc';
        const message = {
            headers: {},
            body: {
                Id: messageId,
                data: 'Hello World'
            }
        };
        const expectedClientMessage = {
            headers: {},
            body: {
                Id: messageId,
                data: 'Hello World'
            }
        };
        const expectedServerMessage = {
            headers: {},
            body: {
                Id: messageId,
                data: 'message received and is valid'
            }
        };
        connection.send(message);
        const _receive = () => {
            connection.receive().then(({ clientMessage, serverMessage }) => {
                if (clientMessage) {
                    expect(JSON.stringify(clientMessage.body)).toBe(JSON.stringify(expectedServerMessage.body));
                    done();
                } else if (serverMessage) {
                    expect(JSON.stringify(serverMessage.body)).toBe(JSON.stringify(expectedClientMessage.body));
                    done();
                } else {
                    setTimeout(_receive, 100);
                }
            }).catch((error) => {
                fail(error);
                done();
            });
        };
        _receive();
    });
});
process.specs.set(suite, []);