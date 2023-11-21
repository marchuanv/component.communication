import { Connection, ConnectionOptions, HttpConnection, Specs } from '../registry.mjs';
const connectionOptions = new ConnectionOptions(3, 10000, 'localhost', 8080, 'localhost', 8080);
const httpConnection = new HttpConnection(connectionOptions);
process.connection = new Connection(httpConnection);
const specs = new Specs(10000, './');
specs.run();