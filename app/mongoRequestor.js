var mongoRequestor = function(config) {

    var value = 0;

    if (!config.host || !config.port || !config.db || !config.collection || !config.refresh) {
        console.log('Bad mongoRequestor configuration');
        return {
            "launch": function() { return this; },
            "value": function() { return value; }
        }; // Stop if no configuration
    }

    var format =  require('util').format;
    var url = format("mongodb://%s:%s/%s", config.host, config.port, config.db);
    var MongoClient = require('mongodb').MongoClient;

    var fetch = function() {
        MongoClient.connect(url, function(err, db) {
            if (err) {
                console.log('MongoDB error :', err);
            } else {
                db.collection(config.collection).count(function(err, count) {
                    console.log("Found ", count, " entries in that collection");
                    response = parseInt(count, 10);
                });
            }
        });
        setTimeout(fetch, config.refresh);
        return this;
    }

    return {
        "launch": fetch,
        "value": function() { return value; }
    }
}

module.exports = mongoRequestor;
