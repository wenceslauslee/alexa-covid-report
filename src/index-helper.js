const constants = require('./constants');
const covidCountyDb = require('./db/covid-county-db');
const covidPostalCountyDb = require('./db/covid-postal-county-db');
const covidStateDb = require('./db/covid-state-db');
const usStateCodes = require('us-state-codes');
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

      return getSummaryHelperPostal(handlerInput, addressInfo.postalCode);
    });
}

function getPostalSummary(handlerInput) {
  checkForPermissions(handlerInput);
  console.log(`${JSON.stringify(handlerInput, null, 2)}`);
  const postalCode = handlerInput.requestEnvelope.request.intent.slots.postalCode.value;

  return getSummaryHelperPostal(handlerInput, postalCode);
}

function getCountyStateSummary(handlerInput) {
  checkForPermissions(handlerInput);
  console.log(`${JSON.stringify(handlerInput, null, 2)}`);

  const county = handlerInput.requestEnvelope.request.intent.slots.county.value;
  const state = handlerInput.requestEnvelope.request.intent.slots.state.value;

  return getSummaryHelperCountyState(handlerInput, county, state);
}

function getSummaryHelperPostal(handlerInput, postalCode) {
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

      return covidCountyDb.query(data.fips);
    })
    .then(data => {
      if (data === undefined) {
        stage = 2;
        throw Error(`No data found for postal code data ${postalCode}`);
      }

      console.log(`Received data: ${JSON.stringify(data, null, 2)}`);
      const speech = defaultSpeech(data.countyName, data.stateNameFull, data.detailedInfo);
      const display = defaultDisplay(data.currentDate, data.countyName,
        usStateCodes.getStateCodeByStateName(data.stateNameFull), data.detailedInfo);

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
          constants.NOTIFY_NO_POSTAL_DATA + `${utils.digitize(postalCode)}. Please try another.`,
          constants.NOTIFY_NO_POSTAL_DATA + `${utils.digitize(postalCode)}. Please try another.`);
      }

      return response(handlerInput, constants.NOTIFY_GENERIC_ERROR, constants.NOTIFY_GENERIC_ERROR);
    });
}

function getSummaryHelperCountyState(handlerInput, countyName, stateNameFull) {
  console.log(`County name is ${countyName}`);
  console.log(`State name is ${stateNameFull}`);

  if (countyName !== null && countyName !== undefined) {
    const notSupportedSpeech = 'Sorry I do not support search by county currently.';
    return response(handlerInput, notSupportedSpeech);
  }

  if (stateNameFull === null || stateNameFull === undefined) {
    return response(handlerInput, constants.NOTIFY_MISSING_COUNTY_STATE, constants.NOTIFY_MISSING_COUNTY_STATE);
  }

  var stage = 0;

  return covidStateDb.query(stateNameFull.toLowerCase())
    .then(data => {
      if (data === undefined) {
        stage = 1;
        throw Error(`No data found for state data ${stateNameFull}`);
      }

      console.log(`Received data: ${JSON.stringify(data, null, 2)}`);
      const speech = defaultSpeech(data.countyName, data.stateNameFull, data.detailedInfo);
      const display = defaultDisplay(data.currentDate, data.countyName,
        usStateCodes.sanitizeStateName(data.stateNameFull), data.detailedInfo);

      return response(handlerInput, speech, display);
    })
    .catch(err => {
      console.log(err);

      if (stage === 1) {
        return response(
          handlerInput,
          `${stateNameFull}` + constants.NOTIFY_INVALID_STATE,
          `${stateNameFull}` + constants.NOTIFY_INVALID_STATE);
      }

      return response(handlerInput, constants.NOTIFY_GENERIC_ERROR, constants.NOTIFY_GENERIC_ERROR);
    });
}

function defaultSpeech(countyName, stateNameFull, detailedInfo) {
  const countyDescription = (countyName === null || countyName === undefined)
    ? '' : `${countyName} County, `;

  return `For ${countyDescription}${stateNameFull}, there are ` +
    `${utils.approximateValue(detailedInfo.activeCount)} cases, accounting for roughly ` +
    `${detailedInfo.activePercentage} percent of population.`;
}

function defaultDisplay(currentDate, countyName, stateName, detailedInfo) {
  const countyDescription = (countyName === null || countyName === undefined)
    ? `${stateName}` : `${countyName} County, ${stateName}`;

  return `${countyDescription}\n\n` +
    `Case Counts: ${detailedInfo.activeCount} (${utils.rank(detailedInfo.activeRank)}) ` +
    `(${utils.changeValue(detailedInfo.activeChange)})\n` +
    `Death Counts: ${detailedInfo.deathCount} (${utils.rank(detailedInfo.deathRank)}) ` +
    `(${utils.changeValue(detailedInfo.deathChange)})\n\n` +
    `~${detailedInfo.activePercentage}% of population has been affected.`;
}

function response(handlerInput, speech, display) {
  return handlerInput.responseBuilder
    .speak(speech)
    .withSimpleCard(constants.SKILL_NAME, display)
    .withShouldEndSession(true)
    .getResponse();
}

module.exports = {
  getCountyStateSummary: getCountyStateSummary,
  getDefaultSummary: getDefaultSummary,
  getPostalSummary: getPostalSummary
};
