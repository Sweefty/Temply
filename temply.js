#!/usr/bin/env node

var path = require("path");
var fs = require("fs");
var copy = require('./copy');

var action = process.argv[2];
function init (){
    var dest = path.resolve(process.cwd());
    var source = path.resolve(__dirname + "/source");
    copy.FolderRecursiveSync(source, dest);
}

if (action === "i" || action === "init"){
    init();
} else {
    var grunt = require("grunt");
    grunt.cli({
        gruntfile: __dirname + "/gruntfile.js",
        temply : {path : process.cwd()}
    });
}
