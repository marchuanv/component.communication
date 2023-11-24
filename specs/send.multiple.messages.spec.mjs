describe('when sending multiple messages given a connection was created', () => {
    fit('should send and receive multiple messages', async () => {
        const connection = process.connection;
        let identifier = 'ca064ae2-dc0c-40ea-ae95-a83934e32bfc';
        const message1ClientData = 'Hello World';
        const message1ServerData = 'message received and is valid';
        const message1 = {
            headers: { identifier },
            data: message1ClientData
        };
        const expectedClientMessage1 = {
            headers: { identifier },
            data: message1ClientData
        };
        const expectedServerMessage1 = {
            headers: { identifier },
            data: message1ServerData
        };
        identifier = '6c0e1b03-ca39-483f-9e93-3c6077626dda';
        const message2ClientData = 'Hello World Again';
        const message2ServerData = 'message received and is valid';
        const message2 = {
            headers: { identifier },
            data: message2ClientData
        };
        const expectedClientMessage2 = {
            headers: { identifier },
            data: message2ClientData
        };
        const expectedServerMessage2 = {
            headers: { identifier },
            data: message2ServerData
        };
        let count = 0;
        const promise = new Promise((resolve, reject) => {
            connection.receive().then(({ serverMessage }) => {
                count = count + 1;
                expect(JSON.stringify(serverMessage.data)).toBe(JSON.stringify(expectedClientMessage1.data));
                if (count === 4) {
                    resolve();
                }
            }).catch((error) => {
                reject(error);
            });
            connection.receive().then(({ serverMessage }) => {
                count = count + 1;
                expect(JSON.stringify(serverMessage.data)).toBe(JSON.stringify(expectedClientMessage2.data));
                if (count === 4) {
                    resolve();
                }
            }).catch((error) => {
                reject(error);
            });
            connection.receive().then(({ clientMessage }) => {
                count = count + 1;
                expect(JSON.stringify(clientMessage.data)).toBe(JSON.stringify(expectedServerMessage1.data));
                if (count === 4) {
                    resolve();
                }
            }).catch((error) => {
                reject(error);
            });
            connection.receive().then(({ clientMessage }) => {
                count = count + 1;
                expect(JSON.stringify(clientMessage.data)).toBe(JSON.stringify(expectedServerMessage2.data));
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