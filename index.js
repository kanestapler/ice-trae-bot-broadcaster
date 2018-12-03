const express = require('express')
const bodyParser = require('body-parser')
const serverless = require('serverless-http')
const Twitter = require('./twitter')
const Slack = require('./slack')
require('dotenv').config()

const app = express()
app.use(bodyParser.json())

const PORT = 3002
const {
    API_TOKEN,
} = process.env


app.get('/', (req, res) => res.send('Tweet Bot Running'))

app.post('/broadcast', (req, res) => {
    const {
        apiToken,
        slackUrl,
        twitterAccessToken,
        twitterAccessTokenSecret,
        message,
    } = req.body
    if (apiToken !== API_TOKEN) {
        res.status(401)
        res.send({ message: 'incorrect token' })
    } else if (!message) {
        res.status(500)
        res.send({ message: 'No message to broadcast' })
    } else {
        Twitter.postTweet(message, twitterAccessToken, twitterAccessTokenSecret)
            .then((tweetResponse) => {
                if (slackUrl) {
                    const tweetUrl = Twitter.getTwitterURL(tweetResponse)
                    Slack.postToSlack(slackUrl, tweetUrl).then(() => {
                        res.send({ message: 'Successful broacast' })
                    }).catch((error) => {
                        console.log(error)
                        res.status(500)
                        res.send({ message: 'Error trying to slack message' })
                    })
                } else {
                    res.send({ message: 'Successful broacast' })
                }
            }).catch((error) => {
                console.log(error)
                res.status(500)
                res.send({ message: 'Error trying to tweet message' })
            })
    }
})

app.listen(PORT, () => console.log(`Tweet Bot app listening on port ${PORT}!`))

module.exports.handler = serverless(app)
