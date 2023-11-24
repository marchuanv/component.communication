import { addSchema, validateSchema } from "../registry.mjs";

export class MessageSchema {
    constructor() {
        addSchema({
            "$id": "https://example.com/message/headers",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "MessageHeaders",
            "type": "object",
            "properties": {
                "identifier": { "type": "string" }
            }
        });
        addSchema({
            "$id": "https://example.com/message",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "Message",
            "type": "object",
            "properties": {
                "headers": { "$ref": "/message/headers" },
                "data": { "type": "string" }
            }
        });
    }
    /**
     * @param { Object } message
    */
    async validate(message) {
        let output = await validateSchema("https://example.com/message", message);
        if (!output.valid) {
            throw new Error('message does not conform to schema: https://example.com/message');
        }
    }
}