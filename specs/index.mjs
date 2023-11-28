import { Connection, ConnectionOptions, HttpConnection, MessageSchema, Specs } from '../registry.mjs';
const connectionOptions = new ConnectionOptions(3, 10000, 'localhost', 8080, 'localhost', 8080);
const httpConnection = new HttpConnection(connectionOptions);
const messageSchema = new MessageSchema();
process.connection = new Connection(httpConnection, messageSchema);
const specs = new Specs(10000, './');
specs.run();