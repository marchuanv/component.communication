import { addSchema, validateSchema } from "../registry.mjs";

export class MessageSchema {
    constructor() {
        addSchema({
            "$id": "https://component.communication/message",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "Message",
            "type": "object",
            "properties": {
                "headers": { "$ref": "/headers" },
                "data": { "$ref": "/string" }
            },
            "required": [
                "headers",
                "data",
            ]
        });
        addSchema({
            "$id": "https://component.communication/headers",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "MessageHeaders",
            "type": "object",
            "properties": {
                "identifier": { "$ref": "/string" },
                "connection": { "$ref": "/connection" }
            },
            "required": [
                "identifier",
                "connection"
            ]
        });
        addSchema({
            "$id": "https://component.communication/connection",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "Connection",
            "type": "object",
            "properties": {
                "clientId": { "$ref": "/string" },
                "clienthost": { "$ref": "/string" },
                "clientport": { "$ref": "/number" },
                "serverhost": { "$ref": "/string" },
                "serverport": { "$ref": "/number" }
            },
            "required": [
                "clientId",
                "clienthost",
                "clientport",
                "serverhost",
                "serverport"
            ]
        });
        addSchema({
            "$id": "https://component.communication/string",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "string"
        });
        addSchema({
            "$id": "https://component.communication/number",
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "type": "number"
        });
    }
    /**
     * @param { Object } message
    */
    async validate(message) {
        let output = await validateSchema("https://component.communication/message", message);
        if (!output.valid) {
            throw new Error('message does not conform to schema: https://component.communication/message');
        }
    }
}