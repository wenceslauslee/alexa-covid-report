const constants = require('./constants');
const covidCountyDb = require('./db/covid-county-db');
const covidPostalCountyDb = require('./db/covid-postal-county-db');
const utils = require('./utils');

function checkForPermissions(handlerInput) {
  const consentToken = handlerInput.requestEnvelope.context.System.user.permissions &&
    handlerInput.requestEnvelope.context.System.user.permissions.consentToken;

  if (!consentToken) {
    return handlerInput.responseBuilder
      .speak(constants.NOTIFY_MISSING_PERMISSIONS)
      .withAskForPermissionsConsentCard(['read::alexa:device:all:address:country_and_postal_code'])
      .getResponse();
  }
}

function getDefaultSummary(handlerInput) {
  checkForPermissions(handlerInput);

  const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
  const deviceAddressServiceClient = handlerInput.serviceClientFactory.getDeviceAddressServiceClient();

  return deviceAddressServiceClient.getCountryAndPostalCode(deviceId)
    .then(addressInfo => {
      console.log(addressInfo);

      return getSummaryHelper(handlerInput, addressInfo.postalCode);
    });
}

function getPostalSummary(handlerInput) {
  checkForPermissions(handlerInput);

  const postalCode = handlerInput.requestEnvelope.request.intent.slots.postalCode.value;

  return getSummaryHelper(handlerInput, postalCode);
}

function getSummaryHelper(handlerInput, postalCode) {
  console.log(postalCode);
  if (postalCode === null || postalCode === undefined) {
    return response(handlerInput, constants.NOTIFY_MISSING_POSTAL_CODE, constants.NOTIFY_MISSING_POSTAL_CODE);
  }

  var stage = 0;

  return covidPostalCountyDb.query(postalCode)
    .then(data => {
      if (data === undefined) {
        stage = 1;
        throw Error(`Malformed postal code data ${postalCode}`);
      }

      return covidCountyDb.query(data.countyStateName);
    })
    .then(data => {
      if (data === undefined) {
        stage = 2;
        throw Error(`No data found for postal code data ${postalCode}`);
      }

      console.log(`Received data: ${JSON.stringify(data, null, 2)}`);
      const speech = defaultSpeech(postalCode, data.county, data.stateFull, data.detailedInfo);
      const display = defaultDisplay(data.currentDate, postalCode, data.county, data.stateShort, data.detailedInfo);

      return response(handlerInput, speech, display);
    })
    .catch(err => {
      console.log(err);

      if (stage === 1) {
        return response(
          handlerInput,
          `${utils.digitize(postalCode)}` + constants.NOTIFY_INVALID_POSTAL_CODE,
          `${utils.digitize(postalCode)}` + constants.NOTIFY_INVALID_POSTAL_CODE);
      } else if (stage === 2) {
        return response(
          handlerInput,
          constants.NOTIFY_NO_DATA + `${utils.digitize(postalCode)}. Please try another.`,
          constants.NOTIFY_NO_DATA + `${utils.digitize(postalCode)}. Please try another.`);
      }

      return response(handlerInput, constants.NOTIFY_GENERIC_ERROR, constants.NOTIFY_GENERIC_ERROR);
    });
}

function defaultSpeech(postalCode, countyName, stateFull, detailedInfo) {
  return `For ${utils.digitize(postalCode)}, ${countyName} County, ${stateFull}, there are ` +
    `${detailedInfo.activeCount} cases and ${detailedInfo.deathCount} deaths.`;
}

function defaultDisplay(currentDate, postalCode, countyName, stateShort, detailedInfo) {
  return `${currentDate}\n` +
    `${postalCode} ${countyName} County, ${stateShort}\n\n` +
    `Case Counts: ${detailedInfo.activeCount} (${utils.rank(detailedInfo.activeRank)}) ` +
    `(${utils.changeValue(detailedInfo.activeChange)})\n` +
    `Death Counts: ${detailedInfo.deathCount} (${utils.rank(detailedInfo.deathRank)}) ` +
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
  getDefaultSummary: getDefaultSummary,
  getPostalSummary: getPostalSummary
};
