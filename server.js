//var express = require('express');
//var app = express();
//
//var config = {
//    serverPort: 9090,
//    directory: __dirname
//};
//
//app.set('title','Flickr test');
//
//app.use(function(req, res, next){
//    //console.log('%s %s', req.method, req.url);
//    next();
//});
//
//app.use(express.compress());
//app.use(express.methodOverride());
//app.use(express.bodyParser());
//app.use(express.directory(config.directory))
//app.use(express.static(config.directory));
//
//app.listen(config.serverPort);
//
//console.log('server listening at %s', config.serverPort);

var express = require('express');
var app = express();


var config = {
    serverPort: 5004,
    directory: __dirname
};

app.set('title','THREE test');
//app.use("/media", express.static(__dirname + '/media'));
app.use("/", express.static(__dirname, '/app'));
//app.use("/js", express.static(__dirname + '/js'));


/* serves main page */
app.get("/", function(req, res) {
    res.sendfile('index.html')
});


app.listen(config.serverPort);

//var http = require("http");
//http.createServer(function (request, response) {
//    response.writeHead(200, {
//        'Content-Type': 'text/plain'
//    });
//    response.write('Simple Simple Fun')
//    response.end();
//}).listen(5002);