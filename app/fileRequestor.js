var fileRequestor = function(config) {

    var value = "";

    if (!config.file || !config.refresh) {
        console.log('Bad fileRequestor configuration');
        return {
            "launch": function() { return this; },
            "value": function() { return value; }
        }; // Stop if no configuration
    }

    var fs = require('fs');

    var fetchFileContent = function(path, callback) {
        fs.readFile(path, 'utf8', function(err, data) {
            if (err) {
                return console.log(err);
            }
            callback(data);
        });
    };

    var fetch = function() {
        fetchFileContent(config.file, function (data) { value = data; });
        setTimeout(fetch, config.refresh);
        return this;
    };

    return {
        "launch": fetch,
        "value": function() { return value; }
    };
};

module.exports = fileRequestor;
