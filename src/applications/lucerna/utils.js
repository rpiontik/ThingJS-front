/**
 * Created by R.Piontik on 17.07.2018.
 */
'use strict'

exports.getContrastYIQ = function (hexcolor){
    var r = parseInt(hexcolor.substr(1,2),16);
    var g = parseInt(hexcolor.substr(3,2),16);
    var b = parseInt(hexcolor.substr(5,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return ((yiq >= 128) ? 'black' : 'white');
}

/*
    dot         - dot structure
    n_channels  - channels number
    return      - result dot structure
 */
exports.calcLevelsByBrightness = function (dot, n_channels){
    let max = 0;
    for(let channel = 0; channel < n_channels; channel++){
        if(dot.spectrum[channel] >  max)
            max = dot.spectrum[channel];
    }

    for(let channel = 0; channel < n_channels; channel++)
        dot.spectrum[channel] = !max ? dot.brightness : dot.brightness * (dot.spectrum[channel] / max);

    return dot;
}

