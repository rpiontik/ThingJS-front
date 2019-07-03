/**
 * Created by R.Piontik on 17.07.2018.
 */
'use strict'

exports.makeURI = function(type, appname, id){
    return `${appname}/${type}/${id}`;
}

exports.parseURI = function(uri){
    let struct = uri.split('/');
    return {
        app : struct[0],
        type : struct[1],
        id : struct[2]
    };
}


