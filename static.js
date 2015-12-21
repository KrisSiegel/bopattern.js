/*
    Start a simple, static file serving server
*/
(function() {
    "use strict";

    var http = require("http");
    var finalHandler = require("finalhandler");
    var serveStatic = require("serve-static");

    var serve = serveStatic("./");

    var server = http.createServer(function(req, res) {
        var done = finalHandler(req, res);
        serve(req, res, done);
    });

    server.listen(8080);
    console.log("Static file server started at http://localhost:8080");
}());
