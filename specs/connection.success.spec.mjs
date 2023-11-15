import { Connection, ConnectionOptions } from '../lib/registry.mjs';
const suite = describe('when creating a connection given successful', () => {
    it('should send a message and receive a success message', (done) => {
        const connectionOptions = new ConnectionOptions(3, 10000, 'localhost', 8080, 'localhost', 8080);
        const connection = new Connection(connectionOptions);
        const message = {
            headers: {},
            body: {
                Id: '1234565',
                data: 'Hello World'
            }
        };
        const expectedClientMessage = {
            headers: {},
            body: {
                Id: message.Id,
                data: 'Hello World'
            }
        };
        const expectedServerMessage = {
            headers: {},
            body: {
                Id: message.Id,
                data: 'message received and is valid'
            }
        };
        connection.receive().then(({ clientMessage, serverMessage }) => {
            expect(JSON.stringify(clientMessage.body)).toBe(JSON.stringify(expectedServerMessage.body));
            expect(JSON.stringify(serverMessage.body)).toBe(JSON.stringify(expectedClientMessage.body));
            done();
        }).catch((error) => {
            fail(error);
            done();
        });
        connection.send(message);
    });
});
process.specs.set(suite, []);