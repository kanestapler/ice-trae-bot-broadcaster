const rp = require('request-promise')

function postToSlack(slackUrl, body) {
    const options = {
        method: 'POST',
        uri: slackUrl,
        body: {
            text: body,
        },
        json: true,
    }
    return rp.post(options)
}

module.exports = {
    postToSlack,
}
