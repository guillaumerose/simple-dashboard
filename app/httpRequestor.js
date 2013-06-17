var httpRequestor = function(config) {

    var values = {};

    if (!config.port || !config.host || !config.urls || config.urls.length === 0 || !config.refresh) {
        console.log('Bad httpRequestor configuration');
        return {
            "launch": function() { return this; },
            "values": function() { return values; }
        }; // Stop if no configuration
    }

     var format =  require('util').format;
     var requestor = (config.port === 80) ? http = require("http") : https = require("https");

    var fillParameters = function(urlArray) {
        var url = urlArray[0];
        if (urlArray.length === 1) {
            return url;
        } else {
            for(var i = 1; i < urlArray.length; i++) {
                if (urlArray[i] === "date") {
                    var date = new Date();
                    var y = ''+date.getUTCFullYear();
                    var m = (date.getUTCMonth() < 10) ? '0'+(date.getUTCMonth()+1) : ''+(date.getUTCMonth()+1);
                    var d = (date.getUTCDate() < 10) ? '0'+date.getUTCDate() : ''+date.getUTCDate();
                    url = format(url, y, m, d);
                } else {
                    url += urlArray[i];
                }
            }
            return url;
        }
    };

    var get = function(path, callback) {
        var options = { 'host': config.host, 'port': config.port, 'path': path, method: 'GET'};
        if (config.username && config.password) { options.auth = config.username+':'+config.password; }
        requestor.request(options, function(res) {
            console.log(config.host+path, res.statusCode);
            var json = "";
            res.on('data', function(chunk) {
                json += chunk;
            }).on('end', function() {
                callback(json);
            });
        }).end();
    };

    var fetch = function() {
        for (var url in config.urls) {
            var path = fillParameters(config.urls[url]);
            get(path, function(url, json) {
                values[url] = json;
            }.bind(this, url));
        }
        setTimeout(fetch, config.refresh);
        return this;
    };

    return {
        "launch": fetch,
        "values": function() { return values; }
    };
};

module.exports = httpRequestor;
