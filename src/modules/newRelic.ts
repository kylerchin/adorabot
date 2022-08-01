import fetch from 'node-fetch';

const { config } = require('./../../config.json');


export function uploadStringToNewRelic(uploadstring: string) {
    if (config.newreliclogapi) {
        try {
            fetch("https://log-api.newrelic.com/log/v1?Api-Key=" + config.newreliclogapi, {
                method: 'POST',
                body: uploadstring

            })
                .then((response) => {
                    // Do something with response
                    console.log(response)
                    return true;
                })
                .catch(function (err) {
                    console.error("Unable to fetch -", err);
                    return false;
                });
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    else {
        console.log("no valid config api key for new relic found in config.json for key newreliclogapi");
    }

}
