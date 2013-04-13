exports.launch = function(config) {

    var http = require("http"),
        https = require("https"),
        express = require('express'),
        format =  require('util').format;
        MongoClient = require('mongodb').MongoClient;

    var twitterMappyInfo = '';
    var twitterLastTweets = '';
    var facebookInfo = '';
    var indoorToday = '';
    var indoorAll = '';
    var audienceWeb = '';
    var audienceAndroid = '';
    var audienceiPhone = '';
    var poisCount = 0;

    var insertDateInUrl = function(url) {
        var date = new Date();
        var y = ''+date.getUTCFullYear();
        var m = (date.getUTCMonth() < 10) ? '0'+date.getUTCMonth() : ''+date.getUTCMonth();
        var d = (date.getUTCDate() < 10) ? '0'+date.getUTCDate() : ''+date.getUTCDate();
        return format(url, y, m, d, y, m, d);
    };

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

    var fetchPoisNumber = function() {
        var url = format("mongodb://%s:%s/%s", config.mongo.host, config.mongo.port, config.mongo.db);
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log('MongoDB error :', err);
            } else {
                db.collection(config.mongo.collection).count(function(err, count) {
                    console.log("Found ", count, " POIs in database");
                    poisCount = parseInt(count, 10);
                });
            }
        });
        setTimeout(fetchPoisNumber, 30 * 1000);
    };

    var fetchIndoorInfo = function() {
        fetchHttp(http, 80, config.indoor.host, insertDateInUrl(config.indoor.urls.today), function(result) { indoorToday = result; }, config.indoor.login, config.indoor.password);
        fetchHttp(http, 80, config.indoor.host, config.indoor.urls.all, function(result) { indoorAll = result; }, config.indoor.login, config.indoor.password);
        setTimeout(fetchPoisNumber, 12 * 60 * 60 * 1000);
    };

    var refreshTwittersInfo = function() {
        fetchHttp(https, 443, 'api.twitter.com', '/1/users/show.json?screen_name='+config.twitter.search, function(json) { twitterMappyInfo = json;});
        fetchHttp(https, 443, 'search.twitter.com', '/search.json?lang=fr&q='+config.twitter.account_name, function(json) { twitterLastTweets = json; });
        setTimeout(refreshTwittersInfo, 60 * 1000);
    };

    var refreshFacebookInfo = function() {
        fetchHttp(https, 443, 'graph.facebook.com', '/fql?q=SELECT%20fan_count,%20page_url%20FROM%20page%20WHERE%20page_id='+config.facebook.page_id, function(json) { facebookInfo = json;});
        setTimeout(refreshFacebookInfo, 60 * 1000);
    };

    var refreshAudienceInfo = function() {
        fetchHttp(https, 443, config.xiti.host, insertDateInUrl(config.xiti.urls.web), function(json) { audienceWeb = json; }, config.xiti.login, config.xiti.password);
        fetchHttp(https, 443, config.xiti.host, insertDateInUrl(config.xiti.urls.android), function(json) { audienceAndroid = json; }, config.xiti.login, config.xiti.password);
        fetchHttp(https, 443, config.xiti.host, insertDateInUrl(config.xiti.urls.ios), function(json) { audienceiPhone = json; }, config.xiti.login, config.xiti.password);
        setTimeout(refreshAudienceInfo, 30 * 1000);
    };

    fetchPoisNumber();
    fetchIndoorInfo();
    refreshAudienceInfo();
    refreshTwittersInfo();
    refreshFacebookInfo();

    var app = express();
    app.configure(function() {
        app.use(app.router);
        app.use(express.static( __dirname+'/www'));
    });
    app.configure('production', function() {
        app.use(express.cache(1000 * 60 * 60));
    });
    app.get('/api/twitter/infos', function(req, res) {
        console.log('Serving /api/twitter/infos');
        res.send(twitterMappyInfo);
    });
    app.get('/api/twitter/lastTweets', function(req, res) {
        console.log('Serving /api/twitter/lastTweets');
        res.send(twitterLastTweets);
    });
    app.get('/api/facebook/fans', function(req, res) {
        console.log('Serving /api/facebook/fans');
        var parsed = JSON.parse(facebookInfo);
        res.send(JSON.stringify(parsed.data[0]));
    });
    app.get('/api/indoor/paris/today', function(req, res) {
        console.log('Serving /api/indoor/paris/today');
        res.send(indoorToday);
    });
    app.get('/api/indoor/paris', function(req, res) {
        console.log('Serving /api/indoor/paris');
        res.send(indoorAll);
    });
    app.get('/api/audience/web', function(req, res) {
        console.log('Serving /api/audience/web');
        var parsed = JSON.parse(audienceWeb);
        res.send({ count: parsed.Rows[0][1]});
    });
    app.get('/api/audience/mobile', function(req, res) {
        console.log('Serving /api/audience/mobile');
        var parsedAndroid = JSON.parse(audienceAndroid);
        var parsediPhone = JSON.parse(audienceiPhone);
        res.send({
            'androidCount': parsedAndroid.Rows[0][1],
            'iphoneCount': parsediPhone.Rows[0][1]
        });
    });
    app.get('/api/pois/count', function(req, res) {
        console.log('Serving /api/pois/count');
        var objResponse = {'count':poisCount};
        res.send(JSON.stringify(objResponse));
    });
    app.listen(8888);
    console.log('Mappy server listening on 8888');
};
