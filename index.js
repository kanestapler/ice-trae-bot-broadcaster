const express = require('express')
const OAuth = require('oauth')
const bodyParser = require('body-parser')
const serverless = require('serverless-http')
const rp = require('request-promise')
require('dotenv').config()
const app = express()
app.use(bodyParser.json())
const PORT = 3002
const TWITTER_POST_URL = 'https://api.twitter.com/1.1/statuses/update.json'
const TWEET_URL = 'https://twitter.com/USER_NAME/status/TWEET_ID'

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

app.post('/emojis', function (req, res) {
    const amount = req.body.amount
    const token = req.body.token
    const slack = req.body.slack
    if (token !== process.env.API_TOKEN) {
        res.status(401)
        res.send({ message: 'incorrect token' })
    } else {
        console.log(`Tweeting ${amount} snowflakes`)
        tweetMadeShot(amount).then(function (twitterResponse) {
            console.log('Successful Tweet')
            if (slack) {
                const tweetUrl = getTwitterURL(twitterResponse)
                postToSlack(tweetUrl).then(function (success) {
                    res.send(`POST Tweet and Slack with ${amount} snowflakes`)
                }).catch(function (responseError) {
                    res.send(`Error during Post to Slack. Tweet posted Successfully. ${responseError}`)
                })
            } else {
                res.send(`POST Tweet with ${amount} snowflakes`)
            }
        }).catch(function (error) {
            console.log('ERROR Tweeting')
            res.send(`Error posting tweet`)
        })
    }
})

app.post('/gameStart', function (req, res) {
    const opponent = req.body.opponent
    const token = req.body.token
    const slack = req.body.slack
    if (token !== process.env.API_TOKEN) {
        res.status(401)
        res.send({ message: 'incorrect token' })
    } else {
        console.log(`Tweeting ${opponent} game start`)
        tweetGameStart(opponent).then(function (twitterResponse) {
            console.log('Successful Tweet')
            if (slack) {
                const tweetUrl = getTwitterURL(twitterResponse)
                postToSlack(tweetUrl).then(function (success) {
                    res.send(`POST Tweet and Slack with ${opponent} game starting`)
                }).catch(function (responseError) {
                    res.send(`Error during Post to Slack. Tweet posted Successfully. ${responseError}`)
                })
            } else {
                res.send(`POST Tweet with ${opponent} game starting`)
            }
        }).catch(function (error) {
            console.log('ERROR Tweeting')
            res.send(error)
        })
    }
})

app.post('/text', function (req, res) {
    const text = req.body.text
    const token = req.body.token
    if (token !== process.env.API_TOKEN) {
        res.status(401)
        res.send({ message: 'incorrect token' })
    } else {
        console.log(`Tweeting ${text}`)
        postTweet(text).then(function (data) {
            console.log('Successful Tweet')
            res.send(`POST Tweet with ${text}`)
        }).catch(function (error) {
            console.log('ERROR Tweeting')
            res.send(error)
        })
    }
})

app.listen(PORT, () => console.log(`Tweet Bot app listening on port ${PORT}!`))

function tweetGameStart(opponent) {
    const tweetBody = process.env.GAME_START_TEXT.replace('TEAM_NAME', opponent)
    return postTweet(tweetBody)
}

function tweetMadeShot(amount) {
    amount = Number(amount)
    const tweetBody = process.env.TWEET_EMOJI.repeat(amount)
    console.log(`tweet body: ${tweetBody}`)
    return postTweet(tweetBody)
}

function postTweet(tweetBody) {
    console.log(tweetBody)
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
                    const twitterResponse = JSON.parse(data)
                    resolve(twitterResponse)
                }
            }
        )
    })
}

function getTwitterURL(twitterResponse) {
    return TWEET_URL.replace('USER_NAME', twitterResponse.user.screen_name).replace('TWEET_ID', twitterResponse.id_str)
}

function postToSlack(body) {
    const url = process.env.SLACK_WEB_HOOK_URL
    const options = {
        method: 'POST',
        uri: url,
        body: {
            text: body
        },
        json: true
    };
    return rp.post(options)
}

module.exports.handler = serverless(app)