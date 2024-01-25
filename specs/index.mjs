
import {
    Connection,
    ConnectionCtorArgs,
    ConnectionOptions,
    ConnectionOptionsCtorArgs,
    CtorArgsRegistry,
    GUID,
    HttpConnection,
    HttpConnectionCtorArgs,
    Message,
    MessageCtorArgs,
    Specs
} from "../registry.mjs";
CtorArgsRegistry.register(new GUID('7ef885cc-602a-4c99-b1fb-1c4f4ef38de3'), HttpConnectionCtorArgs, HttpConnection);
CtorArgsRegistry.register(new GUID('c1df1e69-9539-485a-9917-79dce4e2f7e4'), ConnectionCtorArgs, Connection);
CtorArgsRegistry.register(new GUID('c8a8e10d-2d0a-4e25-9b02-5258226bc817'), ConnectionOptionsCtorArgs, ConnectionOptions);
CtorArgsRegistry.register(new GUID('9f3069e4-c554-43b6-ae0e-b884a899ee3f'), MessageCtorArgs, Message);
const specs = new Specs(60000, './');
specs.run();