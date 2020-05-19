const _ = require('underscore');

function concatenate(results) {
  if (results.length === 1) {
    return results[0];
  } else if (results.length === 2) {
    return results.join(' and ');
  }
  const excludeLast = _.initial(results);
  var stringToReturn = excludeLast.join(', ');
  stringToReturn += ` and ${results[results.length - 1]}`;

  return stringToReturn;
}

function digitize(number) {
  return `<say-as interpret-as="digits">${number}</say-as>`;
}

function changeValue(change) {
  if (change >= 0) {
    return '+' + change;
  }

  return change;
}

function rank(value) {
  if (value % 100 === 11 || value % 100 === 12 || value % 100 === 13) {
    return value + 'th';
  }
  if (value % 10 === 1) {
    return value + 'st';
  }
  if (value % 10 === 2) {
    return value + 'nd';
  }
  if (value % 10 === 3) {
    return value + 'rd';
  }

  return value + 'th';
}

function approximateValue(actualValue) {
  if (actualValue < 100) {
    return `${actualValue}`;
  } else if (actualValue < 10000) {
    return `over ${Math.floor(actualValue / 100)} hundred`;
  }

  return `over ${Math.floor(actualValue / 1000)} thousand`;
}

module.exports = {
  approximateValue: approximateValue,
  changeValue: changeValue,
  concatenate: concatenate,
  digitize: digitize,
  rank: rank
};
