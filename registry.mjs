import { addSchema, validate } from "@hyperjump/json-schema/draft-2020-12";
import Jasmine from 'jasmine';
import dns from 'node:dns';
import { Specs, general } from 'utils';
export { CtorParam, Properties } from 'component.properties';
export { EventEmitter } from 'events';
export { randomUUID } from 'node:crypto';
export { IncomingMessage, ServerResponse, createServer, request } from 'node:http';
export { Stream } from 'node:stream';
export * as url from 'url';
export { Connection } from './lib/connection.mjs';
export { ConnectionOptions } from './lib/connection.options.mjs';
export { ContentType } from './lib/content.type.mjs';
export { HttpConnection } from './lib/http/http.connection.mjs';
export { MessageSchema } from './lib/message.schema.mjs';
export { Jasmine, Specs, addSchema, dns, general, validate as validateSchema };

