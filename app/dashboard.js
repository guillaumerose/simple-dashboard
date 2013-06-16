var http = require("http"),
    https = require("https"),
    express = require('express'),
    format =  require('util').format,
    Twit = require('twit');


var config = null;

var configure = function(configuration) {
    config = configuration
}

var insertDateInUrl = function(url) {
    var date = new Date();
    var y = ''+date.getUTCFullYear();
    var m = (date.getUTCMonth() < 10) ? '0'+(date.getUTCMonth()+1) : ''+(date.getUTCMonth()+1);
    var d = (date.getUTCDate() < 10) ? '0'+date.getUTCDate() : ''+date.getUTCDate();
    return format(url, y, m, d, y, m, d);
};

var launch = function() {
    var T = new Twit(config.twitter);

    var twitterMappyInfo = '';
    var twitterLastTweets = '';
    var facebookInfo = '';
    var indoorToday = '';
    var indoorAll = '';
    var audienceWeb = '';
    var audienceAndroid = '';
    var audienceiPhone = '';
    var audienceBkml = '';
    var audienceFwb = '';
    var edito = '';


    var poiRequestor = require('./mongoRequestor')(config.mongo);
    poiRequestor.launch();

    var editoRequestor = require('./fileRequestor')(config.edito);
    editoRequestor.launch();

    var fetchHttp = function(requestor, port, host, path, callback, username, password) {
        var options = { 'host': host, 'port': port, 'path': path, method: 'GET'};
        if (username && password) { options.auth = username+':'+password; }
        requestor.request(options, function(res) {
            console.log(host, path, res.statusCode);
            var json = "";
            res.on('data', function(chunk) {
                json += chunk;
            }).on('end', function() {
                callback(json);
            });
        }).end();
    };

    var refreshIndoorInfo = function() {
        if (!config.indoor.host || !config.indoor.login || !config.indoor.password || !config.indoor.urls.today || !config.indoor.urls.all) {
            return; // Stop if no configuration
        }
        fetchHttp(http, 80, config.indoor.host, insertDateInUrl(config.indoor.urls.today), function(result) { indoorToday = result; }, config.indoor.login, config.indoor.password);
        fetchHttp(http, 80, config.indoor.host, config.indoor.urls.all, function(result) { indoorAll = result; }, config.indoor.login, config.indoor.password);
        setTimeout(refreshIndoorInfo, config.indoor.refresh);
    };

    var refreshTwittersInfo = function() {
        if (!config.twitter.search || !config.twitter.account_name) {
            return; // Stop if no configuration
        }
        T.get('search/tweets', { q: config.twitter.search, lang: 'fr' }, function(err, reply) {
            if (!err) twitterLastTweets = reply;
        });
        T.get('users/show', { screen_name: config.twitter.account_name }, function(err, reply) {
            if (!err) twitterMappyInfo = reply;
        });
        setTimeout(refreshTwittersInfo, config.twitter.refresh);
    };

    var refreshFacebookInfo = function() {
        if (!config.facebook.page_id) {
            return; // Stop if no configuration
        }
        fetchHttp(https, 443, 'graph.facebook.com', '/fql?q=SELECT%20fan_count,%20page_url%20FROM%20page%20WHERE%20page_id='+config.facebook.page_id, function(json) { facebookInfo = json;});
        setTimeout(refreshFacebookInfo, config.facebook.refresh);
    };

    var refreshAudienceInfo = function() {
        if (!config.xiti.urls.web || !config.xiti.urls.android || !config.xiti.urls.ios || !config.xiti.urls.bkml || !config.xiti.urls.fwb || !config.xiti.login || !config.xiti.password) {
            return; // Stop if no configuration
        }
        fetchHttp(https, 443, config.xiti.host, insertDateInUrl(config.xiti.urls.web), function(json) { audienceWeb = json; }, config.xiti.login, config.xiti.password);
        fetchHttp(https, 443, config.xiti.host, insertDateInUrl(config.xiti.urls.android), function(json) { audienceAndroid = json; }, config.xiti.login, config.xiti.password);
        fetchHttp(https, 443, config.xiti.host, insertDateInUrl(config.xiti.urls.ios), function(json) { audienceiPhone = json; }, config.xiti.login, config.xiti.password);
        fetchHttp(https, 443, config.xiti.host, insertDateInUrl(config.xiti.urls.bkml), function(json) { audienceBkml = json; }, config.xiti.login, config.xiti.password);
        fetchHttp(https, 443, config.xiti.host, insertDateInUrl(config.xiti.urls.fwb), function(json) { audienceFwb = json; }, config.xiti.login, config.xiti.password);
        setTimeout(refreshAudienceInfo, config.xiti.refresh);
    };

    refreshIndoorInfo();
    refreshAudienceInfo();
    refreshTwittersInfo();
    refreshFacebookInfo();

    var app = express();
    app.configure(function() {
        app.use(app.router);
        app.use(express.static( __dirname+'/../www'));
    });
    app.configure('production', function() {
        app.use(express.cache(1000 * 60 * 60));
    });
    app.get('/api/twitter/infos', function(req, res) {
        console.log('Serving /api/twitter/infos');
        res.setHeader('content-type', 'application/json');
        res.send(twitterMappyInfo);
    });
    app.get('/api/twitter/lastTweets', function(req, res) {
        console.log('Serving /api/twitter/lastTweets');
        res.setHeader('content-type', 'application/json');
        res.send(twitterLastTweets);
    });
    app.get('/api/facebook/fans', function(req, res) {
        console.log('Serving /api/facebook/fans');
        res.setHeader('content-type', 'application/json');
        var parsed = JSON.parse(facebookInfo); res.send(JSON.stringify(parsed.data[0]));
    });
    app.get('/api/indoor/paris/today', function(req, res) {
        console.log('Serving /api/indoor/paris/today');
        res.setHeader('content-type', 'application/json');
        res.send(indoorToday);
    });
    app.get('/api/indoor/paris', function(req, res) {
        console.log('Serving /api/indoor/paris');
        res.setHeader('content-type', 'application/json');
        res.send(indoorAll);
    });
    app.get('/api/audience/web', function(req, res) {
        console.log('Serving /api/audience/web');
        res.setHeader('content-type', 'application/json');
        var count = 0;
        if (audienceWeb !== "") {
            try {
                count = JSON.parse(audienceWeb).Rows[0][1];
            } catch(e) {
                console.log('Error while parsing audience response', e);
            }
        }
        res.send({ count: count });
    });
    app.get('/api/audience/mobile', function(req, res) {
        console.log('Serving /api/audience/mobile');
        res.setHeader('content-type', 'application/json');
        var count = {
            android: 0,
            iphone: 0,
            bkml: 0,
            fwb: 0
        };
        if (audienceAndroid !== "" && audienceiPhone !== "" && audienceBkml !== ""&& audienceFwb !== "") {
            try {
                count.android = JSON.parse(audienceAndroid).Rows[0][1];
                count.iphone = JSON.parse(audienceiPhone).Rows[0][1];
                count.bkml = JSON.parse(audienceBkml).Rows[0][1];
                count.fwb = JSON.parse(audienceFwb).Rows[0][1];
            } catch(e) {
                console.log('Error while parsing audience response', e);
            }
        }
        res.send(JSON.stringify(count));
    });
    app.get('/api/pois/count', function(req, res) {
        console.log('Serving /api/pois/count');
        res.setHeader('content-type', 'application/json');
        var objResponse = {'count': poiRequestor.value() };
        res.send(JSON.stringify(objResponse));
    });
    app.get('/api/edito/infos', function(req, res) {
        console.log('Serving /api/edito/infos');
        res.setHeader('content-type', 'application/json');
        var objResponse = {'edito': editoRequestor.value() };
        res.send(JSON.stringify(objResponse));
    });
    app.listen(config.server.port);
    console.log('Mappy Dashboard server listening on '+config.server.port);
};

module.exports = {
    'configure': configure,
    'launch': launch
};
