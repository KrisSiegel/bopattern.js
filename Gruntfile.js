module.exports = (function(grunt) {
    "use strict";

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-mocha-phantomjs');
    grunt.loadNpmTasks('grunt-available-tasks');

    // Get rid of the header output nonsense from grunt (they should really fix this)
    grunt.log.header = function() {};

    /*
    	These are the paths to include or exclude in concatenation and minification steps.
    */
    var paths = [
        "src/main.js",
        "src/loops/*.js",
        "src/sprites/*.js",
        "src/html-sprites/*.js",
        "src/utilities/*.js",
        "!**/*.aspec.js",
        "!**/*.cspec.js",
        "!**/*.nspec.js"
    ];

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: ["./dist/*"],
        concat: {
            js: {
                src: paths,
                dest: "./dist/bopattern.js"
            },
            css: {
                src: ["css/*.css"],
                dest: "./dist/bopattern.css"
            }
        },
        uglify: {
            minify: {
                options: { },
                files: {
                    "./dist/bopattern.min.js": paths
                }
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: false,
                    src: ["css/*.css"],
                    dest: "./dist/bopattern.min.css"
                }]
            }
        },
        mocha_phantomjs: {
            all: ["test/spec.html", "test/spec.min.html"]
        },
        availabletasks: {
            tasks: {
                options: {
                    filter: "include",
                    tasks: ["build", "test"]
                }
            }
        }
    });

    grunt.registerTask("default", ["availabletasks"]);

    /*
    	Grunt is kinda funky; these header:* tasks just print out pretty headers.
    */

    grunt.registerTask("header:building", function() {
        grunt.log.subhead("Building bopattern.js");
    });

    grunt.registerTask("header:clientTesting", function() {
        grunt.log.subhead("Client-side unit testing with phantom.js");
    });

    var jsPaths = ["./src/"];
    var fetchJsFiles = function(filters) {
        var fs = require("fs");
        var path = require("path");
        var results = [];

        for (var k = 0; k < jsPaths.length; ++k) {
            var dirs = fs.readdirSync(jsPaths[k]);

            for (var i = 0; i < dirs.length; ++i) {
                if (fs.statSync(jsPaths[k] + dirs[i]).isDirectory()) {
                    var files = fs.readdirSync(jsPaths[k] + dirs[i]);
                    for (var j = 0; j < files.length; ++j) {
                        var p = path.join("./", jsPaths[k], dirs[i], files[j]);
                        if (results.indexOf(p) === -1) {
                            results.push(p);
                        }
                    }
                } else {
                    var p = path.join("./", jsPaths[k], dirs[i]);
                    if (results.indexOf(p) === -1) {
                        results.push(p);
                    }
                }
            }
        }

        var filteredResults = [];
        for (var i = 0; i < results.length; ++i) {
            var include = false;
            for (var k = 0; k < filters.length; ++k) {
                if (results[i].indexOf(filters[k]) !== -1) {
                    include = true;
                    break;
                }
            }
            if (include) {
                filteredResults.push(results[i]);
            }
        }

        return filteredResults;
    };

    var setRunner = function(runner, files) {
        var fs = require("fs");
        var makeScript = function(path) {
            return "<script type='text/javascript' src='../" + path + "'></script>";
        };

        var scriptHtml = "";

        if (files !== undefined && files.length > 0) {
            var file = files.shift();
            while (file) {
                scriptHtml += makeScript(file) + "\n";
                file = files.shift();
            }
        }
        var runnerFileName = "./" + runner;
        var runnerHtml = fs.readFileSync(runnerFileName, {
            encoding: "utf8"
        });
        var scriptStart = runnerHtml.indexOf("<!-- Start JS Files -->");
        var scriptEnd = runnerHtml.indexOf("<!-- End JS Files -->");

        var newHtml = runnerHtml.substring(0, scriptStart);
        newHtml += "<!-- Start JS Files -->";
        newHtml += scriptHtml;
        newHtml += runnerHtml.substring(scriptEnd);

        fs.writeFileSync(runnerFileName, newHtml, {
            encoding: "utf8"
        });
        fs.writeFileSync(runnerFileName, newHtml, {
            encoding: "utf8"
        });
    };

    /*
    	The setRunner task modifies the spec.html / spec.min.html files, dynamically, with the
    	unit tests within the project to allow test running with phantomjs.
    */
    grunt.registerTask("setRunner", "Set the client side spec runner", function() {
        var tests = fetchJsFiles([".cspec.js", ".aspec.js"]);
        setRunner("test/spec.html", tests.concat([]));
        setRunner("test/spec.min.html", tests.concat([]));
    });

    /*
    	'build' and 'test' are roll-up tasks; they have specific descriptions and execute
    	multiple tasks each to accomplish their goals. These are the only intended tasks
    	to be run by the developer.
    */

    grunt.registerTask("build", "Cleans and builds .js", ["header:building", "clean", "concat", "uglify:minify", "cssmin", "setRunner"]);

    grunt.registerTask("test", "Cleans, builds and runs mocha unit tests through phantom.js", ["build", "header:clientTesting", "mocha_phantomjs"]);

});
