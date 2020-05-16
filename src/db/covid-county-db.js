const db = require('./db-api');

const tableName = 'covid-county';

function query(countyStateName) {
  const params = {
    TableName: tableName,
    ProjectionExpression: 'countyStateName, currentDate, pastDate, county, stateShort, stateFull, detailedInfo',
    KeyConditionExpression: 'countyStateName = :s',
    ExpressionAttributeValues: {
      ':s': countyStateName
    }
  };

  return db.query(params)
    .then(items => items[0]);
}

module.exports = {
  query: query
};
