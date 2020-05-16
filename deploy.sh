npm install &&
rm -rf alexa-covid-report.zip &&
zip -r alexa-covid-report.zip * &&
aws lambda update-function-code --function-name AlexaCovidReport --zip-file fileb://alexa-covid-report.zip