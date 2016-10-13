var chalk = require('chalk');

function getResultColor(result) {
  switch (result) {
    case 'AC':              return 'green';
    case 'TLE': case 'MLE': return 'blue';
    case 'RE':              return 'magenta';
    case 'CE':              return 'yellow';
    case 'WA': case 'PE':   return 'red';
    default:
      return null;
  }
}

module.exports = {
  pad: function(str, n) {
    str = str + '';
    while (str.length < n) str += ' ';
    return str;
  },
  lpad: function(str, n) {
    str = str + '';
    while (str.length < n) str = ' ' + str;
    return str;
  },
  trim: function(str, n) {
    if (str.length <= n)
      return str;
    else
      return str.substring(0, n - 1) + '…';
  },
  colorIcon: function(text, result) {
    var color = chalk.white;
    var cname = getResultColor(result);
    if (result === 'CE') color = color.gray;
    if (!text) return '';
    return color[cname](text);
  },
  colorResult: function(text, result) {
    var color = chalk.white;
    var cname = getResultColor(result);
    if (result === 'CE') color = color.gray;
    if (!text) return '';
    return color['bg' + cname.charAt(0).toUpperCase() + cname.slice(1)](text);
  }
};
