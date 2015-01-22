var path = require("path");
var fs = require("fs");
exports.FileSync = function( source, target ) {

    var targetFile = target;

    //if target is a directory a new file with the same name will be created
    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }
    
    var stream = fs.createReadStream( source ).pipe( fs.createWriteStream( targetFile ) );
};

exports.FolderRecursiveSync = function( source, target, cb, inner ) {
    var files = [];
    var i = 0;

    //check if folder needs to be created or integrated
    var targetFolder = path.join( target, path.basename( source ) );
    if (!inner){
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
                exports.FolderRecursiveSync( curSource, targetFolder, cb, true );
            } else {
                exports.FileSync( curSource, targetFolder );
            }
        });
    }
};
