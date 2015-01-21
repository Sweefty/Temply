#!/usr/bin/env node

var path = require("path");
var fs = require("fs");
function copyFileSync( source, target ) {

    var targetFile = target;

    //if target is a directory a new file with the same name will be created
    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }

    fs.createReadStream( source ).pipe( fs.createWriteStream( targetFile ) );
}

var i = 0;
function copyFolderRecursiveSync( source, target ) {
    var files = [];

    //check if folder needs to be created or integrated
    var targetFolder = path.join( target, path.basename( source ) );
    if (i === 0){
        i = 1;
        targetFolder = path.resolve(targetFolder + "/../");
    }

    console.log(targetFolder);
    if ( !fs.existsSync( targetFolder ) ) {
        fs.mkdirSync( targetFolder );
    }

    //copy
    if ( fs.lstatSync( source ).isDirectory() ) {
        files = fs.readdirSync( source );
        files.forEach( function ( file ) {
            var curSource = path.join( source, file );
            if ( fs.lstatSync( curSource ).isDirectory() ) {
                copyFolderRecursiveSync( curSource, targetFolder );
            } else {
                copyFileSync( curSource, targetFolder );
            }
        } );
    }
}
var working = process.cwd();

var action = process.argv[2];
function init (){
    var dest = path.resolve(process.cwd());
    var source = path.resolve(__dirname + "/source");
    copyFolderRecursiveSync(source, dest);
}

if (action === "i" || action === "init"){
    init();
} else {
    //console.log(process.argv);
    //var grunt = require('grunt');
    //grunt.task.init = function() {};
    //var g = require('./gruntfile.js');
    //g(grunt);
    //grunt.tasks('watch');
    
    var grunt = require("grunt");
    grunt.cli({
        gruntfile: __dirname + "/gruntfile.js",
        temply : {path : process.cwd()}
    });
}
