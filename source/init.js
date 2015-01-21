//where to compile html pages, (dist) by default 
exports.outLocation = '';

//handlebars partials
exports.partials = {};

//handlebars helpers
exports.helpers = {
    test : function(arg1){}
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
