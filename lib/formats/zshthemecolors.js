'use strict';

var _ = require('lodash');
var fs = require('fs');
var termcolors = require('termcolors');

var template = fs.readFileSync(__dirname + '/zshthemecolors.dot', 'utf8');

module.exports = {
  export: termcolors.export(template, _.partialRight(_.mapValues, function (color) {
    return color.toRgbObject().r + ';' + color.toRgbObject().g + ';' + color.toRgbObject().b;
  }))
};
