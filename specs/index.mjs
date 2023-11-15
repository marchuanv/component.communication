import Jasmine from 'jasmine';
import * as url from 'url';
process.specs = new WeakMap();
const __dirname = url.fileURLToPath(new URL('./', import.meta.url));
const jasmine = new Jasmine({ projectBaseDir: __dirname });
jasmine.jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
jasmine.addMatchingSpecFiles(['**/*.spec.mjs']);
jasmine.execute();
process.on('exit', () => {
    const topLevelSuite = jasmine.env.topSuite();
    for (const child of topLevelSuite.children) {
        if (child.suite_.status() === 'passed') {
            console.log('Test Passed');
        } else {
            console.log('Test Failed');
        }
    }
});
