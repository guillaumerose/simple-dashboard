var fileRequestor = function(config) {

    if (!config.file || !config.refresh) {
        console.log('Bad fileRequestor configuration');
        return; // Stop if no configuration
    }


    var value = "";
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
    };

    return {
        "launch": fetch,
        "value": function() {
            return value;
        }
    }
}

module.exports = fileRequestor;
