const db = require('./db-api');

const tableName = 'covid-county';

function query(fips) {
  const params = {
    TableName: tableName,
    ProjectionExpression: 'fips, currentDate, pastDate, countyName, stateNameFull, detailedInfo',
    KeyConditionExpression: 'fips = :s',
    ExpressionAttributeValues: {
      ':s': fips
    }
  };

  return db.query(params)
    .then(items => items[0]);
}

module.exports = {
  query: query
};
