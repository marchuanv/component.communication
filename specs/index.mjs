
import { ConnectionOptions, Jasmine, url } from '../registry.mjs';
process.specs = new WeakMap();
const projectBaseDir = url.fileURLToPath(new URL('./', import.meta.url));
const jasmine = new Jasmine({ projectBaseDir });
jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
jasmine.addMatchingSpecFiles(['**/*.spec.mjs']);
process.connectionOptions = new ConnectionOptions(3, 10000, 'localhost', 8080, 'localhost', 8080);
jasmine.execute();