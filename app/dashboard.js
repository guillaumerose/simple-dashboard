var dashboard = function(config) {

    var launch = function() {

        var poiRequestor         = require('./mongoRequestor')(config.mongo).launch();
        var editoRequestor       = require('./fileRequestor')(config.edito).launch();
        var twitterRequestor     = require('./twitterRequestor')(config.twitter).launch();
        var facebookRequestor    = require('./httpRequestor')(config.facebook).launch();
        var xitiRequestor        = require('./httpRequestor')(config.xiti).launch();
        var indoorTodayRequestor = require('./httpRequestor')(config.indoor).launch();

        var express = require('express');
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
            res.send(twitterRequestor.values()['info']);
        });
        app.get('/api/twitter/tweets', function(req, res) {
            console.log('Serving /api/twitter/lastTweets');
            res.setHeader('content-type', 'application/json');
            res.send(twitterRequestor.values()['tweets']);
        });
        app.get('/api/facebook/fans', function(req, res) {
            console.log('Serving /api/facebook/fans');
            res.setHeader('content-type', 'application/json');
            try {
                var value = facebookRequestor.values()["fans"];
                var parsed = JSON.parse(value); 
                res.send(JSON.stringify(parsed.data[0]));
            } catch(e) {
                console.log('Error while parsing facebook response', e);
            }
        });
        app.get('/api/indoor/paris', function(req, res) {
            console.log('Serving /api/indoor/paris');
            res.setHeader('content-type', 'application/json');
            res.send(indoorTodayRequestor.values()['all']);
        });
        app.get('/api/indoor/paris/today', function(req, res) {
            console.log('Serving /api/indoor/paris/today');
            res.setHeader('content-type', 'application/json');
            res.send(indoorTodayRequestor.values()['today']);
        });
        app.get('/api/audience/web', function(req, res) {
            console.log('Serving /api/audience/web');
            res.setHeader('content-type', 'application/json');
            var values = xitiRequestor.values();
            var count = 0;
            if (!values || values.length === 0) {
                try {
                    count = JSON.parse(values["web"]).Rows[0][1];
                } catch(e) {
                    console.log('Error while parsing web audience response', e);
                }
            }
            res.send({ count: count });
        });
        app.get('/api/audience/mobile', function(req, res) {
            console.log('Serving /api/audience/mobile');
            res.setHeader('content-type', 'application/json');
            var values = xitiRequestor.values();
            var count = {
                android: 0,
                iphone: 0,
                bkml: 0,
                fwb: 0
            };
            if (!values || values.length === 0) {
                try {
                    count.android = JSON.parse(values["android"]).Rows[0][1];
                    count.iphone = JSON.parse(values["iphone"]).Rows[0][1];
                    count.bkml = JSON.parse(values["bkml"]).Rows[0][1];
                    count.fwb = JSON.parse(values["fwb"]).Rows[0][1];
                } catch(e) {
                    console.log('Error while parsing mobile audience response', e);
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

    return {
        "launch": launch
    }
};

module.exports = dashboard;
