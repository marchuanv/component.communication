import { Connection, ConnectionOptions, GUID, HttpConnection, Specs } from '../registry.mjs';
const connectionOptions = new ConnectionOptions(new GUID(), 3, 10000, 'localhost', 8080, 'localhost', 8080);
const httpConnection = new HttpConnection(new GUID(), connectionOptions);
process.connection = new Connection(new GUID(), httpConnection);
const specs = new Specs(10000, './');
specs.run();