var twitterRequestor = function(config) {

    if (!config.consumer_key || !config.consumer_secret || !config.access_token || !config.access_token_secret || !config.search || !config.account_name || !config.refresh) {
        console.log('Bad twitterRequestor configuration');
        return; // Stop if no configuration
    }

    var values = {};

    var Twit = require('twit');
    var T = new Twit(config);

    var fetch = function() {
        if (!config.search || !config.account_name) {
            return; // Stop if no configuration
        }
        T.get('search/tweets', { q: config.search, lang: 'fr' }, function(err, reply) {
            if (!err) values.tweets = reply;
        });
        T.get('users/show', { screen_name: config.account_name }, function(err, reply) {
            if (!err) values.info = reply;
        });
        setTimeout(fetch, config.refresh);
        return this;
    };

    return {
        "launch": fetch,
        "values": function() {
            return values;
        }
    }
}

module.exports = twitterRequestor;
