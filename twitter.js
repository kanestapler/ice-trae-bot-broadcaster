const OAuth = require('oauth')
require('dotenv').config()

const TWITTER_POST_URL = 'https://api.twitter.com/1.1/statuses/update.json'
const TWEET_URL = 'https://twitter.com/USER_NAME/status/TWEET_ID'
const {
    CONSUMER_KEY,
    CONSUMER_SECRET,
} = process.env

const oauth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    CONSUMER_KEY,
    CONSUMER_SECRET,
    '1.0A',
    null,
    'HMAC-SHA1'
)

function postTweet(tweetBody, accessToken, accessTokenSecret) {
    return new Promise((resolve, reject) => {
        oauth.post(
            TWITTER_POST_URL,
            accessToken,
            accessTokenSecret,
            { status: tweetBody },
            (error, data) => {
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

module.exports = {
    postTweet,
    getTwitterURL,
}
