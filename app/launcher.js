var fs = require('fs'),
    dashboard = require('./dashboard');

fs.readFile(__dirname+'/config.json', 'utf8', function (err, data) {
    if (err) { return console.log('No config file found :', err); }
    dashboard.configure(JSON.parse(data));
    dashboard.launch();
});
