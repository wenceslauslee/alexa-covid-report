const db = require('./db-api');

const tableName = 'covid-county';

function query(postalCode) {
  const params = {
    TableName: tableName,
    ProjectionExpression: 'postalCode, county, stateShort, stateFull, detailedInfo',
    KeyConditionExpression: 'postalCode = :s',
    ExpressionAttributeValues: {
      ':s': postalCode
    }
  };

  return db.query(params)
    .then(items => items[0]);
}

module.exports = {
  query: query
};
