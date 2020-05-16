const constants = require('./constants');
const covidCountyDb = require('./db/covid-county-db');
const covidPostalCountyDb = require('./db/covid-postal-county-db');
const utils = require('./utils');

function getDefaultSummary(handlerInput) {
  const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
  const deviceAddressServiceClient = handlerInput.serviceClientFactory.getDeviceAddressServiceClient();
  var postalCode;

  return deviceAddressServiceClient.getCountryAndPostalCode(deviceId)
    .then(addressInfo => {
      console.log(addressInfo);
      postalCode = addressInfo.postalCode;

      return covidPostalCountyDb.query(addressInfo.postalCode)
        .then(data => covidCountyDb.query(data.countyStateName));
    })
    .then(data => {
      console.log(`Received data: ${JSON.stringify(data, null, 2)}`);
      const speech = defaultSpeech(postalCode, data.county, data.stateFull, data.detailedInfo);
      const display = defaultDisplay(data.currentDate, postalCode, data.county, data.stateShort, data.detailedInfo);

      return response(handlerInput, speech, display);
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
}

function defaultSpeech(postalCode, countyName, stateFull, detailedInfo) {
  return `For ${utils.digitize(postalCode)}, ${countyName} County, ${stateFull}, the case count is ` +
    `${detailedInfo.activeCount}. The death count is ${detailedInfo.deathCount}.`;
}

function defaultDisplay(currentDate, postalCode, countyName, stateShort, detailedInfo) {
  return `${currentDate}\n\n` +
    `${postalCode} ${countyName} County, ${stateShort}\n\n` +
    `Case Count: ${detailedInfo.activeCount} (${utils.rank(detailedInfo.activeRank)}) ` +
    `(${utils.changeValue(detailedInfo.activeChange)})\n\n` +
    `Death Count: ${detailedInfo.deathCount} (${utils.rank(detailedInfo.deathRank)}) ` +
    `(${utils.changeValue(detailedInfo.deathChange)})`;
}

function response(handlerInput, speech, display) {
  return handlerInput.responseBuilder
    .speak(speech)
    .withSimpleCard(constants.SKILL_NAME, display)
    .withShouldEndSession(true)
    .getResponse();
}

module.exports = {
  getDefaultSummary: getDefaultSummary
};
