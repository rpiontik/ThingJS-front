const UglifyJS = require("uglify-es");
const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const apps_path = path.resolve(__dirname, '../src/applications/');
const chalk = require('chalk')

module.exports = {
    make(app_name, manifest){
        if(!('scripts' in manifest) || !('modules' in manifest.scripts))
            return;

        for(let script_name in manifest.scripts.modules) {

            let params      = manifest.scripts.modules[script_name];
            params.optimize = 'optimize' in params ? params.optimize : true;
            params.uglify   = 'uglify' in params ? params.uglify : true;

            let source      = path.resolve(apps_path, app_name, params.source);
            let dist        = path.resolve('dist/apps', app_name, `${script_name}.mjs`);

            utils.mkdirp(dist);

            let code    = fs.readFileSync(source, "utf8");

            if(params.optimize) {
                let uglify_options = {
                    mangle: {
                        toplevel: 'uglify' in params.optimize ? params.optimize.uglify : true
                    },
                    compress : {
                        collapse_vars   : false
                    },
                };

                let uglify_res  = UglifyJS.minify(code, uglify_options);
                if(uglify_res.error)
                    throw new Error(`Error in mjs file ${source} line ${uglify_res.error.line} col ${uglify_res.error.col}\n${uglify_res.error}`);

                code = uglify_res.code;
            }

            if(!('mjsfiles' in global))
                global.mjsfiles = [];
            fs.writeFileSync(dist, code, "utf8");
            global.mjsfiles.push(`apps/${app_name}/${script_name}.mjs`);
        }
    }
}