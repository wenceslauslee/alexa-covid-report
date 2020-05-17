const constants = require('./constants');
const covidCountyDb = require('./db/covid-county-db');
const covidPostalCountyDb = require('./db/covid-postal-county-db');
const utils = require('./utils');

function getDefaultSummary(handlerInput) {
  const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
  const consentToken = handlerInput.requestEnvelope.context.System.user.permissions &&
    handlerInput.requestEnvelope.context.System.user.permissions.consentToken;

  if (!consentToken) {
    return handlerInput.responseBuilder
      .speak(constants.NOTIFY_MISSING_PERMISSIONS)
      .withAskForPermissionsConsentCard(['read::alexa:device:all:address:country_and_postal_code'])
      .getResponse();
  }

  const deviceAddressServiceClient = handlerInput.serviceClientFactory.getDeviceAddressServiceClient();
  var promptForPostalCode = false;
  var postalCode;

  return deviceAddressServiceClient.getCountryAndPostalCode(deviceId)
    .then(addressInfo => {
      console.log(addressInfo);
      if (addressInfo.postalCode === null) {
        promptForPostalCode = true;
        throw Error('Missing postal code for address.');
      }
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

      if (promptForPostalCode) {
        return response(handlerInput, constants.NOTIFY_MISSING_POSTAL_CODE, constants.NOTIFY_MISSING_POSTAL_CODE);
      }

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
