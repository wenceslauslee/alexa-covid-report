# Alexa COVID-19 Report
An Alexa skill to report on COVID-19 status daily data. All data is obtained from New York Times. https://github.com/nytimes/covid-19-data

The skill requires you to have your postal code registered on your device. Default reporting will be based on this postal code.

### Core features

  - Get summary of COVID-19 daily status in your county/state

### How to use skill (example utterances)

> Alexa, open covid report.

### Installation

1. Go to the Alexa App on your device and enable skill "COVID Report".
2. Configure your postal code on your device and enable skill to access this information.

### Building

Code requires [Node.js](https://nodejs.org/) v12+ to build.

Install the dependencies and devDependencies and deploy the lambda.

```sh
$ cd alexa-covid-report
$ npm install
$ rm -rf alexa-covid-report.zip
$ zip -r alexa-covid-report.zip *
$ aws lambda update-function-code --function-name AlexaCovidReport --zip-file fileb://alexa-covid-report.zip
```

### Todos

 - Write Tests
 - Expand out to specific postal codes
 - Display more detailed information for devices with screens

License
----

MIT © Wenhao Lee

### Contact

Please let me know if you have any suggestions at wenceslauslee@gmail.com.
