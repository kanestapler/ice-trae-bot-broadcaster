const express = require('express')
const OAuth = require('oauth')
const bodyParser = require('body-parser')
const serverless = require('serverless-http')
require('dotenv').config()
const app = express()
app.use(bodyParser.json())
const PORT = 3002
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
    const token = req.body.token
    if (token !== process.env.API_TOKEN) {
        res.status(401)
        res.send({ message: 'incorrect token' })
    } else {
        console.log(`Tweeting ${amount} snowflakes`)
        postTweet(amount).then(function (data) {
            console.log('Successful Tweet')
            res.send(`POST Tweet with ${amount} snowflakes`)
        }).catch(function (error) {
            console.log('ERROR Tweeting')
            res.send(`Error posting tweet`)
        })
    }
})

app.listen(PORT, () => console.log(`Tweet Bot app listening on port ${PORT}!`))

function postTweet(amount) {
    amount = Number(amount)
    const tweetBody = TWEET_EMOJI.repeat(amount)
    console.log(`tweet body: ${tweetBody}`)
    return new Promise(function (resolve, reject) {
        oauth.post(
            TWITTER_POST_URL,
            process.env.ACCESS_TOKEN,
            process.env.ACCESS_TOKEN_SECRET,
            { "status": tweetBody },
            function (error, data) {
                if (error) {
                    reject(error)
                } else {
                    resolve(JSON.parse(data))
                }
            }
        )
    })
}

module.exports.handler = serverless(app)