/**
 * Created by R.Piontik on 17.07.2018.
 */
'use strict';

exports.getContrastColor = function (hexcolor) {
  if (hexcolor.indexOf('#') === 0) {
    hexcolor = hexcolor.slice(1);
  }

  let r = parseInt(hexcolor.slice(0, 2), 16);
  let g = parseInt(hexcolor.slice(2, 4), 16);
  let b = parseInt(hexcolor.slice(4, 6), 16);

  return (r * 0.299 + g * 0.587 + b * 0.114) > 186 ? '#000000' : '#FFFFFF';
};

/*
    dot         - dot structure
    n_channels  - channels number
    return      - result dot structure
 */
exports.calcLevelsByBrightness = function (dot, n_channels) {
  let max = 0;
  for (let channel = 0; channel < n_channels; channel++) {
    if (dot.spectrum[channel] > max) { max = dot.spectrum[channel]; }
  }

  for (let channel = 0; channel < n_channels; channel++) { dot.spectrum[channel] = !max ? dot.brightness : dot.brightness * (dot.spectrum[channel] / max); }

  return dot;
};
