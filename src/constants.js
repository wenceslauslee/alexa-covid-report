module.exports = {
  // Skill related constants
  SKILL_NAME: 'COVID-19 REPORT',

  // Prompts
  NOTIFY_MISSING_PERMISSIONS: 'Please enable Location permissions in the Amazon Alexa app.',
  NOTIFY_MISSING_POSTAL_CODE: 'It looks like you don\'t have a postal code set for this device. ' +
    'You can set your address from the companion app.',
  NOTIFY_INVALID_POSTAL_CODE: ' is an invalid postal code. Please try another.',
  NOTIFY_NO_POSTAL_DATA: 'It looks like I don\'t have data for postal code ',
  NOTIFY_GENERIC_ERROR: 'Sorry, I ran into some issues and a bug report has been filed. Please try another command.',
  NOTIFY_INVALID_STATE: ' is an invalid state. Please try another.',

  // Intents
  GET_COUNTY_STATE_SUMMARY_INTENT: 'GetCountyStateSummaryIntent',
  GET_DEFAULT_SUMMARY_INTENT: 'GetDefaultSummaryIntent',
  GET_POSTAL_SUMMARY_INTENT: 'GetPostalSummaryIntent'

  // Current states

  // Direction
};
