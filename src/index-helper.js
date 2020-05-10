const constants = require('./constants');
const covidCountyDb = require('./covid-county-db');
const utils = require('./utils');

function getDefaultSummary(handlerInput) {
  const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
  const deviceAddressServiceClient = handlerInput.serviceClientFactory.getDeviceAddressServiceClient();
  return deviceAddressServiceClient.getCountryAndPostalCode(deviceId)
    .then(addressInfo => {
      console.log(addressInfo);

      return covidCountyDb.query(addressInfo.postalCode);
    })
    .then(data => {
      console.log(`Received data: ${JSON.stringify(data, null, 2)}`);
      const speech = defaultSpeech(data.postalCode, data.county, data.stateFull, data.detailedInfo.county);
      const display = defaultDisplay(data.postalCode, data.county, data.stateShort, data.detailedInfo.county);
      console.log(`${speech}, ${display}`);

      return response(handlerInput, speech, display);
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
}

function defaultSpeech(postalCode, county, stateFull, detailedInfo) {
  return `For ${utils.digitize(postalCode)} ${county} County, ${stateFull}, the current case count is ` +
    `${detailedInfo.activeCount}. The death count is ${detailedInfo.deathCount}`;
}

function defaultDisplay(postalCode, county, stateShort, detailedInfo) {
  return `${postalCode} ${county} County, ${stateShort}\n\n` +
    `Case Count: ${detailedInfo.activeCount} (${detailedInfo.activeRank})\n\n` +
    `Death Count: ${detailedInfo.deathCount} (${detailedInfo.deathRank})`;
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
