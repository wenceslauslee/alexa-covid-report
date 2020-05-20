const Alexa = require('ask-sdk-core');
const constants = require('./constants');
const indexHelper = require('./index-helper');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    return indexHelper.getDefaultSummary(handlerInput);
  }
};

const GetPostalSummaryIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === constants.GET_POSTAL_SUMMARY_INTENT;
  },
  handle(handlerInput) {
    return indexHelper.getPostalSummary(handlerInput);
  }
};

const GetCountyStateSummaryIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === constants.GET_COUNTY_STATE_SUMMARY_INTENT;
  },
  handle(handlerInput) {
    return indexHelper.getCountyStateSummary(handlerInput);
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return indexHelper.handleHelpInput(handlerInput);
  }
};

const CancelIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(constants.STOP_MESSAGE)
      .withSimpleCard(constants.SKILL_NAME, constants.STOP_MESSAGE)
      .withShouldEndSession(true)
      .getResponse();
  }
};

const StopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(constants.STOP_MESSAGE)
      .withSimpleCard(constants.SKILL_NAME, constants.STOP_MESSAGE)
      .withShouldEndSession(true)
      .getResponse();
  }
};

const NavigateHomeIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.currentState = null;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(constants.REPROMPT_TRY_AGAIN)
      .withSimpleCard(constants.SKILL_NAME, constants.REPROMPT_TRY_AGAIN)
      .withShouldEndSession(false)
      .getResponse();
  }
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.currentState = null;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(constants.REPROMPT_TRY_AGAIN)
      .withSimpleCard(constants.SKILL_NAME, constants.REPROMPT_TRY_AGAIN)
      .withShouldEndSession(false)
      .getResponse();
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder
      .speak('stop')
      .withSimpleCard(constants.SKILL_NAME, 'done')
      .withShouldEndSession(true)
      .getResponse();
  }
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error encountered: ${error}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I ran into some error. Please try again later.')
      .withShouldEndSession(true)
      .getResponse();
  }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    GetPostalSummaryIntentHandler,
    GetCountyStateSummaryIntentHandler,
    HelpIntentHandler,
    CancelIntentHandler,
    StopIntentHandler,
    FallbackIntentHandler,
    NavigateHomeIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
