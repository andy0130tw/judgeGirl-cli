var chalk = require('chalk');

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
  colorResult: function(text, result) {
    var color = chalk.white;
    switch (result) {
      case 'AC':
        return color.bgGreen(text);
      case 'TLE':
        return color.bgBlue(text);
      case 'CE':
        return color.bgYellow(text);
      case 'WA': case 'PE':
        return color.bgRed(text);
      default:
        return text;
    }
  }
}