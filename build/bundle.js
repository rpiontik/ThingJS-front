'use strict'
const path = require('path')
const fs = require('fs')
const Manifest = require('./manifest')

module.exports = {
    createBundle(bundle, manifest){
        fs.writeFileSync(bundle, "SMTB02");
        this.appendName(bundle, manifest.name);

        //JSON manifest
        let exp_manifest = Object.assign({}, manifest);
        for(let key in exp_manifest) {
            if(key.charAt(0) === '$') {
                delete exp_manifest[key];
            }
        }

        let manifest_raw = new Buffer(JSON.stringify(exp_manifest), 'UTF-8');
        fs.appendFileSync(bundle, Buffer.from(new Uint32Array([manifest_raw.length]).buffer), "binary");
        fs.appendFileSync(bundle, manifest_raw);

        //Binary manifest
        let binary_raw  = Manifest.binary(manifest);
        fs.appendFileSync(bundle, Buffer.from(new Uint32Array([binary_raw.length]).buffer), "binary");
        fs.appendFileSync(bundle, binary_raw);

        //Storages
        let storages = Manifest.storages(manifest);
        for(let storage_name in storages){
            this.appendName(bundle, `data/${storage_name}`);
            let storage = storages[storage_name];
            fs.appendFileSync(bundle, Buffer.from(new Uint32Array([storage.length]).buffer), "binary");
            fs.appendFileSync(bundle, new Buffer(storage));
        }

        //Files
        Manifest.files(manifest).map((file) => {
            this.appendFile(bundle, path.resolve(manifest.$src_path, file.src), file.dist);
        });
    },
    appendName(bundle, name){
        fs.appendFileSync(bundle, Buffer.from(new Uint32Array([name.length]).buffer), "binary");
        fs.appendFileSync(bundle, name);
    },
    appendFile(bundle, source, dist) {
        this.appendName(bundle, dist);
        fs.appendFileSync(bundle, Buffer.from(new Uint32Array([fs.statSync(source).size]).buffer), "binary");
        fs.appendFileSync(bundle, fs.readFileSync(source, 'binary'), "binary");
    },
    make(appname) {
        let bundle = `${appname}/${appname}.smt`;
        let bundle_path = path.resolve(__dirname, '../dist/apps', bundle);
        let app_path = path.resolve(__dirname, `../dist/apps/${appname}/`);

        this.createBundle(bundle_path, Manifest.make(appname));

        fs.readdirSync(app_path).forEach(file => {
            if([`${appname}.smt`, 'manifest.json'].indexOf(path.basename(file)) < 0){
                this.appendFile(bundle_path, path.resolve(app_path, file), path.basename(file));
            }
        });

        return bundle;
    }
}
