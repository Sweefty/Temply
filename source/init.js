//where to compile html pages, (dist) by default
exports.outLocation = '';

//handlebars object
exports.handlebars = function(Handlebars){

    // this gets some information about
    // current compiled page
    // current.location
    // current.layout
    // current.hbs
    // current.page
    // current.data
    // Handlebars.registerHelper('helper', helper);
    // Handlebars.registerPartial('partial', partial);
    var current = exports.current;
};


exports.data = {
    //define some javascript files to use with this project
    "javascript" : [],

    //define fonts
    "fonts" : [
        "https://fonts.googleapis.com/css?family=Dosis",
    ],

    //global options, add more options!
    "description" : "raw base template",
    "title" : "raw starting point template"
};


var fs = require('fs');
exports.fileHandler = {
    'html' : function(dir, content){
        var content = fs.readFileSync(dir).toString('utf8');
        return content;
    },
    // 'gif' : 'ignore'
};
