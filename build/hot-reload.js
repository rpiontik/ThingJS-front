const fs = require('fs');
const path = require('path');
const utils = require('./utils');
const apps_path = path.resolve(__dirname, '../src/applications/');

let mjs_imports = "import HotReloadRuntime from './hot-reload-rt';\n\n";

fs.readdirSync(apps_path).forEach(app_name => {
    if (fs.lstatSync(path.resolve(apps_path, app_name)).isDirectory()) {
        let manifest    = require(path.resolve(apps_path, app_name, "manifest.json"));

        if(('scripts' in manifest) && ('modules' in manifest.scripts)) {
            for(let script_name in manifest.scripts.modules) {
                let params      = manifest.scripts.modules[script_name];
                if(params.hot_reload !== false) {
                    let source = `../src/applications/${app_name}/${params.source}`;
                    let target = JSON.stringify({
                        type : 'mjs',
                        app : manifest.name,
                        object : script_name
                    });

                    mjs_imports += `HotReloadRuntime.appendItem(Object.assign(${target}, {source: require('!!raw-loader!${source}').default}));\n`;
                }
            }
        }
    }
});

mjs_imports += "HotReloadRuntime.doReload();\n";

fs.writeFileSync(path.resolve(__dirname, '_hot-reload.js'), mjs_imports + "\n");