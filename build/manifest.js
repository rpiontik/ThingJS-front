'use strict'
const path = require('path')
const fs = require('fs')
const storage = require('./storage')

module.exports = {
    BIN_BLOCK_NAME : 0,
    BIN_BLOCK_ENTRY : 1,
    BIN_BLOCK_SUBSCRIPTION : 2,
    BIN_BLOCK_STORAGE_STRUCT_VERSION : "STR01",
    BIN_BLOCK_STORAGE_OBJECT : 10,
    BIN_BLOCK_STORAGE_VERSION : 11,
    BIN_BLOCK_STORAGE_MIGRATION : 12,
    BIN_BLOCK_STORAGE_TYPE_INT : 13,
    BIN_BLOCK_STORAGE_TYPE_DOUBLE : 14,
    BIN_BLOCK_STORAGE_TYPE_OBJECT : 15,
    check(manifest){
        //todo file name max 64
        //todo MAX_TASK_NAME_LEN 16
        if(!('name' in manifest))
            throw new Error(`Unknown application name`);

        if(manifest.name.length > 64)
            throw new Error(`Application name is too long ${manifest.name} max 64 chars`);

        if('scripts' in manifest){
            if(!('entry' in manifest.scripts))
                throw new Error(`The ${manifest.name} application do not have required block [entry] im manifest`);

            if(!('modules' in manifest.scripts))
                throw new Error(`The ${manifest.name} application do not have required block [modules] in manifest`);

            if(!(manifest.scripts.entry in manifest.scripts.modules))
                throw new Error(`The ${manifest.name} application has entry [${manifest.scripts.entry}] but do not have module for it`);
        }

        if('storage' in manifest) {
            if(!('objects' in manifest.storage))
                throw new Error(`Storage of ${manifest.name} do not have required block "objects"`);
            for(let object_name in manifest.storage.objects) {
                if(!('struct' in manifest.storage.objects[object_name]))
                    throw new Error(`The ${manifest.name} application has error in storage structure [storage/objects/${object_name}/struct}]`);
            }
        }
    },

    make(app){
        const app_path  = path.resolve(__dirname, '../src/applications/', app);

        let manifest    = require(path.resolve(app_path, "manifest.json"));

        this.check(manifest);

        if(fs.existsSync(path.resolve(app_path, "favicon.png"))) {
            manifest.favicon    = 'data:image/png;base64,'
                + new Buffer(fs.readFileSync(path.resolve(app_path, "favicon.png"))).toString('base64');
        } else if(fs.existsSync(path.resolve(app_path, "favicon.svg"))) {
            manifest.favicon    = 'data:image/svg+xml;utf8,'
                + fs.readFileSync(path.resolve(app_path, "favicon.svg"));
        }

        if(app in global.components){
            for(let cname in manifest.components){
                if(cname in global.components[app])
                    manifest.components[cname].source =
                        process.env.NODE_ENV === 'production'
                            ? global.components[app][cname].bundle_dist
                            : global.components[app][cname].bundle;
            }
        }

        return manifest;
    },

    makeBinaryField(type, name){
        return Buffer.concat([
            Buffer.from(new Uint32Array([type]).buffer),
            Buffer.from(new Uint32Array([name.length]).buffer),
            Buffer.from(name, 'UTF-8'),
        ]);
    },

    binary(manifest){
        let result  = [];

        //No script side
        if(!('scripts' in manifest))
            return Buffer.from([]);

        //Application name
        result.push(this.makeBinaryField(this.BIN_BLOCK_NAME, manifest.name));

        //Entry name
        result.push(this.makeBinaryField(this.BIN_BLOCK_ENTRY, manifest.scripts.entry));

        //Subscriptions
        if('subscriptions' in manifest.scripts)
            manifest.scripts.subscriptions.map((item) => {
                result.push(this.makeBinaryField(this.BIN_BLOCK_SUBSCRIPTION, item));
            });

        return Buffer.concat(result);
    },

    storages(manifest){
        let result  = {};

        //Storage
        if('storage' in manifest){
            for(let object_name in manifest.storage.objects)
                result[object_name] = storage.makeBinaryHeader(manifest.storage.objects[object_name]);
        }

        return result;
    }
}