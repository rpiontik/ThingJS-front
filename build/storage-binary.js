'use strict';
const StorageBuilder = require('./storage');

module.exports = {

    parseBinaryInt8 (state) {
        let result = new DataView(state.data, state.offset).getInt8(0, true);
        state.offset += 1;
        return result;
    },

    makeBinaryInt8 (value) {
        return new Uint8Array([value === null ? 0 : 1 * value]);
    },

    parseBinaryInt32 (state) {
        let result = new DataView(state.data, state.offset).getInt32(0, true);
        state.offset += 4;
        return result;
    },

    makeBinaryInt32 (value) {
        return new Uint8Array(new Uint32Array([value === null ? 0 : 1 * value]).buffer);
    },

    parseBinaryDouble64 (state) {
        let result = new DataView(state.data, state.offset).getFloat64(0, true);
        state.offset += 8;
        return result;
    },

    makeBinaryDouble64 (value) {
        return new Uint8Array(new Float64Array([value === null ? 0 : 1 * value]).buffer);
    },

    parseBinaryString (state) {
        let len = this.parseBinaryInt32(state);
        let str = (new TextDecoder('utf-8')).decode(new DataView(state.data, state.offset, len));
        state.offset += len;
        return str;
    },

    parseBinaryField (state) {
        let result = {
            prefix: this.parseBinaryInt32(state),
            name: ''
        };
        result.level = Math.floor(result.prefix / 2048);
        result.type = result.prefix % 2048;

        let char = new DataView(state.data, state.offset).getUint8();
        while (char) {
            result.name += String.fromCharCode(char);
            state.offset++;
            char = new DataView(state.data, state.offset).getUint8();
        }
        state.offset++;
        return result;
    },

    parseBinaryStruct (state) {
        let result = [];
        let items = result;
        let levels = [];
        state.row_size = 0;
        while (state.offset < state.header_size) {
            let field = this.parseBinaryField(state);

            while (levels.length > field.level) {
                items = levels.pop();
            }

            switch (field.type) {
            case StorageBuilder.BIN_BLOCK_STORAGE_VERSION : {
                state.version = field.name;
                break;
            }
            case StorageBuilder.BIN_BLOCK_STORAGE_MIGRATION : {
                state.migration = field.name;
                break;
            }
            case StorageBuilder.BIN_BLOCK_STORAGE_TYPE_OBJECT : {
                let obj = {
                    name: field.name,
                    substruct: []
                };
                items.push(obj);
                levels.push(items);
                items = obj.substruct;
                break;
            }
            case StorageBuilder.BIN_BLOCK_STORAGE_TYPE_INT : {
                items.push({
                    name: field.name,
                    parser: this.parseBinaryInt32,
                    maker: this.makeBinaryInt32
                });
                state.row_size += 4;
                break;
            }
            case StorageBuilder.BIN_BLOCK_STORAGE_TYPE_DOUBLE : {
                items.push({
                    name: field.name,
                    parser: this.parseBinaryDouble64,
                    maker: this.makeBinaryDouble64
                });
                state.row_size += 8;
                break;
            }
            default:
                throw `Error type field ${field.type}`;
            }
        }

        return result;
    },

    // Parsing binary object header + body to object
    parseBinaryRow (state) {
        let parseSubStruct = function (substruct) {
            let result = {};
            for (let fieldName in substruct) {
                let field = substruct[fieldName];
                if ('substruct' in field) {
                    result[field.name] = parseSubStruct(field.substruct);
                } else {
                    result[field.name] = field.parser(state);
                }
            }
            return result;
        };

        return parseSubStruct(state.struct);
    },

    // Parsing object structure
    parseStructObject (data) {
        let state = {
            part: StorageBuilder.BIN_BLOCK_STORAGE_VERSION,
            data: data,
            offset: 0
        };

        state.header_size = this.parseBinaryInt32(state);
        state.offset += state.sig_size = 9; // Skip signature data
        state.struct = this.parseBinaryStruct(state);
        return state;
    },

    // Parsing binary object with header and body
    parseBinaryObject (data) {
        let result = [];
        let state = this.parseStructObject(data);
        while (state.offset < state.data.byteLength) {
            if (!this.parseBinaryInt8(state)) {
                result.push(this.parseBinaryRow(state));
            }
        }

        return result;
    },

    // Making binary row of storage
    // fields - fields array
    // object - javascript object
    makeBinaryRow (fields, object) {
        let result = null;
        for (let f = 0; f < fields.length; f++) {
            let field = fields[f];
            let binData = null;

            if ('substruct' in field) {
                binData = this.makeBinaryRow(field.substruct, !object ? null : object[field.name]);
            } else {
                binData = fields[f].maker(!object ? null : object[field.name]);
            }

            result = result ? StorageBuilder.concatUint8Array([result, binData]) : binData;
        }
        return result;
    },

    // Making binary storage file with header and body
    // struct - JSON structure of object
    // data - data of storage
    // return - binary storage (header + body)
    makeBinaryObject (struct, data) {
        // Making binary header
        let header = StorageBuilder.makeBinaryHeader(struct);
        let result = header;

        // Convert binary header to array fields
        let state = {
            part: StorageBuilder.BIN_BLOCK_STORAGE_VERSION,
            data: header.buffer,
            offset: 0
        };
        state.header_size = this.parseBinaryInt32(state);
        state.offset += 9; // Skip signature data
        let fields = this.parseBinaryStruct(state);

        // Making binary body
        for (let index in data) {
            result = StorageBuilder.concatUint8Array([
                result,
                new Uint8Array([0]).buffer, // Delete flag
                this.makeBinaryRow(fields, data[index])
            ]);
        }

        return result;
    }
};
