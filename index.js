const express = require('express')
const bodyParser = require('body-parser')
const OAuth = require('OAuth')
const serverless = require('serverless-http')
require('dotenv').config()
const app = express()
app.use(bodyParser.json())
const PORT = 3000
const TWEET_EMOJI = '❄️'
const TWITTER_POST_URL = 'https://api.twitter.com/1.1/statuses/update.json'

var oauth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    process.env.CONSUMER_KEY,
    process.env.CONSUMER_SECRET,
    '1.0A',
    null,
    'HMAC-SHA1'
)
app.get('/', (req, res) => res.send('Tweet Bot Running'))

app.post('/', function (req, res) {
    const amount = req.body.amount
    let postResult = postTweet(amount)
    res.status = postResult
    res.send(`POST Tweet with ${amount} snowflakes`)
})

app.listen(PORT, () => console.log(`Tweet Bot app listening on port ${PORT}!`))

async function postTweet(amount) {
    const tweetBody = TWEET_EMOJI.repeat(amount)
    oauth.post(
        TWITTER_POST_URL,
        process.env.ACCESS_TOKEN,
        process.env.ACCESS_TOKEN_SECRET,
        {"status":tweetBody},
        function(error, data) {
            if (error) {
                console.log('*** ERROR TWEETING ***', error)
            }
        }
    )
}

module.exports.handler = serverless(app)