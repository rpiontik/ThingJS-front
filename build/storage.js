'use strict'

let crc32 =  require('./crc32');

module.exports = {
    BIN_BLOCK_STORAGE_OBJECT : 10,
    BIN_BLOCK_STORAGE_VERSION : 11,
    BIN_BLOCK_STORAGE_MIGRATION : 12,
    BIN_BLOCK_STORAGE_TYPE_INT : 13,
    BIN_BLOCK_STORAGE_TYPE_DOUBLE : 14,
    BIN_BLOCK_STORAGE_TYPE_OBJECT : 15,

    stringToUint8(string) {
        let uintArray = [];
        for (var i = 0; i < string.length; i++)
            uintArray.push(string.charCodeAt(i));
        return new Uint8Array(uintArray);
    },

    stringToC(string) {
      return this.stringToUint8(string + String.fromCharCode(0));
    },

    concatUint8Array() {
        let result = new Uint8Array([]);
        for (var i = 0; i < arguments.length; i++) {
            if(arguments[i] instanceof Array) {
                for(let f = 0; f < arguments[i].length; f++)
                    result = this.concatUint8Array(result, arguments[i][f]);
            } else {
                let tmp = new Uint8Array(result.byteLength + arguments[i].byteLength);
                tmp.set(result);
                tmp.set(arguments[i], result.byteLength);
                result = tmp;
            }
        }
        return result;
    },

    makeBinaryField(type, name){
        return this.concatUint8Array(
            new Uint8Array(new Uint32Array([type]).buffer),
            this.stringToC(name)
        );
    },

    makeBinarySignature(binary_header){
        return this.concatUint8Array(
            this.stringToUint8("STR01"),
            new Uint8Array(new Uint32Array([crc32.calcByBinary(binary_header)]).buffer)
        );
    },

    makeBinaryHeader(object_manifest){
        //Encoding object structure
        let encode_struct = (node, level) => {
            let level_prefix = level * 2048;
            let result  = [];
            Object.keys(node).sort().forEach((field) => {
                if(node[field] === "double") {
                    result.push(this.makeBinaryField(level_prefix + this.BIN_BLOCK_STORAGE_TYPE_DOUBLE, field));
                } else if(node[field] === "int") {
                    result.push(this.makeBinaryField(level_prefix + this.BIN_BLOCK_STORAGE_TYPE_INT, field));
                } else if(typeof node[field] === 'object'){
                    result.push(this.makeBinaryField(level_prefix + this.BIN_BLOCK_STORAGE_TYPE_OBJECT, field));
                    result.push(encode_struct(node[field], level + 1));
                } else
                    throw new Error(`Storage of ${manifest.name} have error type "${node[field]}"`);

            });
            return this.concatUint8Array(result);
        };

        let header = this.concatUint8Array([
            //Version
            this.makeBinaryField(this.BIN_BLOCK_STORAGE_VERSION, 'version' in object_manifest ? "" + object_manifest.version : "0"),
            //Migration
            this.makeBinaryField(this.BIN_BLOCK_STORAGE_MIGRATION, 'migration' in object_manifest ? object_manifest.migration : ""),
            //Struct
            encode_struct(object_manifest.struct, 0)
        ]);

        //Adding signature of storage
        header = this.concatUint8Array([
            this.makeBinarySignature(header),
            header
        ]);

        return this.concatUint8Array([
            new Uint8Array(new Uint32Array([header.length]).buffer),
            header
        ]);

    }
}