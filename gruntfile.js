var fs     = require('fs');
var path   = require('path');
var assert = require('assert');
var handlebars = require('handlebars');
var copy = require('./copy.js');
var args   = process.argv;

//grab second arg options
var template = args[3];

var global_handlebars_data = {
    bower : "{{assets}}/components",
    default_javascript : [
        'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js',
        '{{assets}}/js/app.js'
    ],

    default_css : [
        'https://cdnjs.cloudflare.com/ajax/libs/normalize/3.0.1/normalize.min.css',
        '{{assets}}/css/bare.css',
        '{{assets}}/css/main.css'
    ],

    default_fonts : [
        'https://fonts.googleapis.com/css?family=Dosis',
    ]
}

module.exports = function(grunt) {

    var temply = grunt.option("temply");
    var temp_dir = temply ? temply.path : null;
    if (!temp_dir) {
        var res = template.split(/^--/);
        temp_dir = path.resolve(__dirname + '/templates/' + res[1] + '/');
    } else {
        temp_dir = path.resolve(temp_dir);
    }

    if (!fs.existsSync(temp_dir)){
        throw new Error(res[1] + ' does not seem to be a valid template name');
    }

    //template specific file loader
    function get_file (file){
        return path.resolve(temp_dir + '/' + file);
    }

    var files     = {};
    var outcss    = get_file("dist/assets/css/main.css");
    files[outcss] = get_file("less/main.less");

    var init = require(get_file('init.js'));

    //each template can define a seperate layout
    //it must be named layout.hbs and under template root directory
    //if not then global layout will be used
    var layout = get_file("layout.hbs");
    try {
        layout = fs.lstatSync(layout).isFile() ? layout : 'layout.hbs';
    } catch (e){
        layout = 'layout.hbs';
    }

    grunt.registerTask('Copy', 'Compy Files To Location', function() {
        this.requires(['less', 'Compile']);
        if (init.outLocation){
            var done = this.async();
            var cb = function(){ done("Copying Files"); };

            copy.FolderRecursiveSync(get_file("dist"), path.resolve(temp_dir, init.outLocation), cb);
            setTimeout(function(){ cb(); }, 1000);
        }
    });

    grunt.registerTask('Clean', 'Cleaning Task', function(){
        // init.clean();
    });

    grunt.registerTask('Compile', 'Compile Handlebars', function() {
        //go through each page.hbs, and compile
        var baseLocation = get_file("pages");
        var baseDestination = get_file("dist");
        if (init.handlebars && typeof init.handlebars === 'function'){
            init.handlebars(handlebars);
        }

        (function LoopFiles (location){
            
            var rel = path.relative(location, baseLocation);
            var assets = rel.replace('\\', '/');
            if (!assets){
                assets = './assets';
            } else { assets += '/assets'; }

            global_handlebars_data.assets = assets;
            

            var currentDest = location.split(baseLocation)[1] || '/';
            currentDest += '/';
            

            var hbs = fs.readdirSync(location);
            var layoutContent = fs.readFileSync(layout);
            

            var page_data;
            var data = (function(){
                for (keys in global_handlebars_data){
                    if (!init.data[keys]){
                        init.data[keys] = global_handlebars_data[keys];
                    }
                }
                return init.data;
            })();

            /* pages starting with ipage- are special pages created automatically 
            so remove and unlink if they are found in directory as they will be 
            created again */
            for (var i = 0; i < hbs.length; i++){
                var hb = hbs[i];
                var re = /^ipage-/;
                if (re.test(hb)){
                    hbs.splice(i, 1);
                    --i;
                    fs.unlinkSync(get_file("pages" + currentDest + hb));
                }
            }

            for (var i = 0; i < hbs.length; i++){
                var hb = hbs[i];
                var page = get_file("pages" + currentDest + hb);
                
                if (fs.lstatSync( page ).isDirectory()){
                    if ( !fs.existsSync( get_file("dist" + currentDest + hb) ) ) {
                        fs.mkdirSync( get_file("dist" + currentDest + hb) );
                    }

                    LoopFiles(page);
                    continue;
                }
                
                handlebars.registerHelper("config", function(context, options){
                    var text = context.fn();
                    page_data = eval ("(" + text + ")");
                    for (key in data){
                        if (!page_data[key]){
                            page_data[key] = data[key];
                        }
                    }
                    return "";
                });
                
                //export back some information about current
                //page, so you can use it with handlebars helpers
                init.current = {
                    location : location,
                    page : page,
                    layout : layout,
                    hbs : hbs,
                    data : page_data
                };

                var pagecontent = fs.readFileSync(page).toString("utf8");
                var p = handlebars.compile(pagecontent);

                data.assets = assets;
                var page_out = p(data);

                handlebars.registerPartial("content", page_out);
                
                //split
                var f = hb.split('.');
                if (f[1] !== 'hbs'){ continue; }

                var filename = f[0] + '.html';

                var all = page_data || data || {};
                all.assets = assets;

                var template = handlebars.compile(layoutContent.toString("utf8"));
                var out = template(all);
                
                //FIXME: we compile 2 times just to parse
                //{{assets}} within global options
                //there must be a better way to do this
                template = handlebars.compile(out);
                out = template({ assets : assets });
                
                fs.writeFileSync(get_file("dist" + currentDest + filename), out);
                
                page_data = null;
            }
        })(baseLocation);
    });

    grunt.initConfig({
        less: {
            development: {
                options: {
                    paths : ["./less", __dirname + "/less"],
                    // compress: true,
                    // yuicompress: true,
                    // optimization: 4
                },
                files: files
            }
        },

        watch: {
            styles: {
                files: [get_file('less/**/*.less')],
                tasks: ['less','Compile', 'Copy'],
                options: {
                    nospawn: true
                }
            },

            templates: {
                files: [ get_file('**/*.hbs'), get_file('init.js') ],
                tasks: ['less','Compile', 'Copy'],
                options: {
                    nospawn: true
                }
            }
        }
    });

    //load
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    //register
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('watcher', ['watch']);
    grunt.registerTask('compile', ['less','Compile', 'Copy', 'Clean']);
};
