var express = require('express');
var compression = require('compression')
var hostname = 'app.scoledge.com';

var app = express();

// The number of milliseconds in one day
var oneDay = 86400000;

// Use compress middleware to gzip content
//app.use(compression);

app.use(function (req, res, next) {

    var schema = (req.headers['x-forwarded-proto'] || '').toLowerCase();

    if (schema !== 'https') {
        return res.redirect('https://' + hostname + req.url);
    }
    
    if(req.url == '/') {
        console.log(req.connection.remoteAddress + ' ' + req.method + ' ' + req.url);
    }

    next();
})


// Serve up content from public directory
app.use(express.static(__dirname + '/dist', { maxAge: oneDay }));

var port = process.env.PORT || 8080;

app.listen(port);

console.log('Listening on port ' + port)
