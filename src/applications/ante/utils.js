export default {
    getStrVersion(manifest){
        return (`version` in manifest ? manifest.version : '0') + '.'
            + (`subversion` in manifest ? manifest.subversion : '0') + '.'
            + (`patch` in manifest ? manifest.patch : '0');
    },
    getDescription(manifest){
        if(!('description' in manifest))
            return '';
        let lang = $store.state.display.lang;

        if(lang in manifest.description)
            return manifest.description[lang];
        else
            return manifest.description['en'];
    }
}