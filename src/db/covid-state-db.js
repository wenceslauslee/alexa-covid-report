const db = require('./db-api');

const tableName = 'covid-state';

function query(stateNameFull) {
  const params = {
    TableName: tableName,
    ProjectionExpression: 'currentDate, pastDate, stateNameFull, detailedInfo',
    KeyConditionExpression: 'stateNameFull = :s',
    ExpressionAttributeValues: {
      ':s': stateNameFull
    }
  };

  return db.query(params)
    .then(items => items[0]);
}

module.exports = {
  query: query
};
