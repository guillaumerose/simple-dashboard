var mongoRequestor = function(config) {

    if (!config.host || !config.port || !config.db || !config.collection) {
        console.log('Bad mongoRequestor configuration');
        return; // Stop if no configuration
    }

    var value = 0;
    var format =  require('util').format;
    var url = format("mongodb://%s:%s/%s", config.host, config.port, config.db);
    var MongoClient = require('mongodb').MongoClient;

    var fetch = function() {
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log('MongoDB error :', err);
            } else {
                db.collection(config.collection).count(function(err, count) {
                    console.log("Found ", count, " entry in that collection");
                    response = parseInt(count, 10);
                });
            }
        });
        setTimeout(fetch, config.refresh);
    }

    return {
        "launch": fetch,
        "value": function() {
            return value;
        }
    }
}

module.exports = mongoRequestor;
