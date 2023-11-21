describe('when sending multiple messages given a connection was created', () => {
    it('should send and receive multiple messages', async () => {
        const connection = process.connection;
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
        const message2ClientData = 'Hello World Again';
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
        let count = 0;
        const promise = new Promise((resolve, reject) => {
            connection.receive().then(({ serverMessage }) => {
                count = count + 1;
                expect(JSON.stringify(serverMessage.body)).toBe(JSON.stringify(expectedClientMessage1.body));
                if (count === 4) {
                    resolve();
                }
            }).catch((error) => {
                reject(error);
            });
            connection.receive().then(({ serverMessage }) => {
                count = count + 1;
                expect(JSON.stringify(serverMessage.body)).toBe(JSON.stringify(expectedClientMessage2.body));
                if (count === 4) {
                    resolve();
                }
            }).catch((error) => {
                reject(error);
            });
            connection.receive().then(({ clientMessage }) => {
                count = count + 1;
                expect(JSON.stringify(clientMessage.body)).toBe(JSON.stringify(expectedServerMessage1.body));
                if (count === 4) {
                    resolve();
                }
            }).catch((error) => {
                reject(error);
            });
            connection.receive().then(({ clientMessage }) => {
                count = count + 1;
                expect(JSON.stringify(clientMessage.body)).toBe(JSON.stringify(expectedServerMessage2.body));
                if (count === 4) {
                    resolve();
                }
            }).catch((error) => {
                reject(error);
            });
            connection.send(message1);
            connection.send(message2);
        });
        await promise;
    });
});