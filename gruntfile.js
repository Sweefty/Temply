var fs     = require('fs');
var path   = require('path');
var assert = require('assert');

var args   = process.argv;
assert.ok(args[3], "please specify a third argument");
//grab second arg options
var template = args[3];

//parse template
var patt = /^--/;
var res = template.split(patt);
assert.ok(res[1], "second arg option must start with --");
var temp_dir = path.resolve(__dirname + '/templates/' + res[1] + '/');
console.log(temp_dir);

//template specific file loader
function get_file (file){
    return path.resolve(temp_dir + '/' + file);
}

var files     = {};
var outcss    = get_file("dist/assets/css/main.css");
files[outcss] = get_file("less/main.less");


module.exports = function(grunt) {
    grunt.initConfig({
        less: {
            development: {
                // options: {
                //     compress: true,
                //     yuicompress: true,
                //     optimization: 4
                // },
                files: files
            }
        },

        'compile-handlebars': {
            compile : {
                // preHTML: 'test/fixtures/pre-dev.html',
                // postHTML: 'test/fixtures/post-dev.html',
                template: 'layout.hbs',
                partials: [ get_file('handlebars/index.hbs') ],
                templateData: get_file('data.json'),
                output:  get_file('dist/index.html'),
                globals: [{}]
            }
        },

        watch: {
            styles: {
                files: [get_file('less/**/*.less')],
                tasks: ['less'],
                options: {
                    nospawn: true
                }
            },

            templates: {
                files: [ get_file('handlebars/**/*.hbs'), get_file('data.json') ],
                tasks: ['compile-handlebars'],
                options: {
                    nospawn: true
                }
            }

        }
    });

    //load
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-compile-handlebars');

    //register
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('watcher', ['watch']);
    grunt.registerTask('assemble', ['compile-handlebars']);
};
