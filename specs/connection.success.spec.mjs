import { Connection, ConnectionOptions } from '../lib/registry.mjs';
const suite = describe('when creating a connection given successful', () => {
    it('should send a message and receive a success message', async () => {
        const connectionOptions = new ConnectionOptions(3, 10000, 'localhost', 8080, 'localhost', 8080);
        const connection = new Connection(connectionOptions);
        const isOpen = await connection.open();
        expect(isOpen).toBeTrue();
        const response = await connection.send({
            headers: {},
            body: {
                Id: '1234565',
                data: 'Hello World'
            }
        });
        expect(isOpen).toBeTrue();
        expect(JSON.stringify(response)).toBe(JSON.stringify({ Id: '1234565', data: 'message received and is valid' }));
    });
});
process.specs.set(suite, []);