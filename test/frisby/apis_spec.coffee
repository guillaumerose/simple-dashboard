frisby = require 'frisby'
HOST = 'http://localhost:8000'

frisby.globalSetup({
    request: {
        headers:{'Accept': 'application/json'}
    }
})

frisby
    .create('Get twitter data')
    .get(HOST + '/api/twitter/infos')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
        "name": "Mappy",
        "screen_name": "Mappy"
    })
    .toss()

frisby
    .create('Get last tweets')
    .get(HOST + '/api/twitter/lastTweets')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .toss()

frisby
    .create('Get Facebook data')
    .get(HOST + '/api/facebook/fans')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSONTypes({
        fan_count: Number,
        page_url: String
    })
    .toss()

frisby
    .create('Get indoor Paris data')
    .get(HOST + '/api/indoor/paris')
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .toss()

