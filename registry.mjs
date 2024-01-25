import dns from 'node:dns';
import { GUID, Specs } from 'utils';
export { Container, CtorArgs, CtorArgsRegistry } from 'component.container';
export { EventEmitter } from 'events';
export { IncomingMessage, Server, ServerResponse, createServer, request } from 'node:http';
export { Stream } from 'node:stream';
export * as url from 'url';
export { Connection, ConnectionCtorArgs } from "./lib/connection.mjs";
export { ConnectionOptions, ConnectionOptionsCtorArgs } from "./lib/connection.options.mjs";
export { ContentType } from './lib/content.type.mjs';
export { HttpConnection, HttpConnectionCtorArgs } from "./lib/http/http.connection.mjs";
export { MessageHeaders } from './lib/message.headers.mjs';
export { Message, MessageCtorArgs } from "./lib/message.mjs";
export { MessagePriority } from './lib/message.priority.mjs';
export { GUID, Specs, dns };

