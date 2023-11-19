import { ConnectionOptions, Specs } from '../registry.mjs';
process.connectionOptions = new ConnectionOptions(3, 10000, 'localhost', 8080, 'localhost', 8080);
const specs = new Specs(10000, './');
specs.run();