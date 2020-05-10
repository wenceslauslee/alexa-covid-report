const attributes = require('./attributes');
const constants = require('./constants');
const mbtaInfo = require('./mbta-info');
const moment = require('moment-timezone');
const prediction = require('./prediction');
const stopRouteDb = require('./stop-route-db');
const timeHelper = require('./time-helper');
const utils = require('./utils');
const _ = require('underscore');

function callDirectiveService(handlerInput, speechOutput) {
  const requestEnvelope = handlerInput.requestEnvelope;
  const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient();
  const requestId = requestEnvelope.request.requestId;
  const endpoint = requestEnvelope.context.System.apiEndpoint;
  const token = requestEnvelope.context.System.apiAccessToken;

  const directive = {
    header: {
      requestId
    },
    directive: {
      type: 'VoicePlayer.Speak',
      speech: speechOutput
    }
  };

  return directiveServiceClient.enqueue(directive, endpoint, token);
}

function getDefaultSummary(handlerInput) {
  console.log('jump jump');
  const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;
  const deviceAddressServiceClient = handlerInput.serviceClientFactory.getDeviceAddressServiceClient();
  return deviceAddressServiceClient.getCountryAndPostalCode(deviceId)
    .then(addressInfo => {
      console.log(addressInfo);
      const postalCode = addressInfo.postalCode;
      console.log('thump thump');

      return response(
        handlerInput,
        `For ${utils.digitize(postalCode)} Middlesex County, Massachusetts, the current active count is 76743`,
        `${postalCode} Middlesex\nActive Count: 100`
      );
    });
}

function handleHelpInput(handlerInput) {
  const deviceId = handlerInput.requestEnvelope.context.System.device.deviceId;

  return getSessionAttributes(handlerInput, deviceId)
    .then(sessionAttributes => {
      refreshRecent(sessionAttributes);
      sessionAttributes.currentState = null;
      attributes.setAttributes(handlerInput, sessionAttributes);

      return response(handlerInput, constants.HELP_PROMPT, constants.HELP_PROMPT, constants.REPROMPT_TRY_AGAIN, false);
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
}

// Gets session attributes from request, otherwise reads from DB.
function getSessionAttributes(handlerInput, deviceId) {
  const sessionAttributes = attributes.getAttributes(handlerInput);
  if (!sessionAttributes.recent) {
    return stopRouteDb.query(deviceId)
      .then(data => {
        attributes.setAttributes(handlerInput, data);
        return data;
      });
  }
  return Promise.resolve(sessionAttributes);
}

function response(handlerInput, speech, display) {
  return handlerInput.responseBuilder
    .speak(speech)
    .withSimpleCard(constants.SKILL_NAME, display)
    .withShouldEndSession(true)
    .getResponse();
}

module.exports = {
  callDirectiveService: callDirectiveService,
  getDefaultSummary: getDefaultSummary,
  handleHelpInput: handleHelpInput
};
