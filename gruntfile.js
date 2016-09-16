var fs     = require('fs-extra');
var path   = require('path');
var assert = require('assert');
var handlebars = require('handlebars');
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

    var less_files     = {};

    var init = require(get_file('init.js'));
    var dist = init.outLocation || "dist";

    //each template can define a seperate layout
    //it must be named layout.hbs and under template root directory
    //if not then global layout will be used
    var layout = get_file("layout.hbs");
    try {
        layout = fs.lstatSync(layout).isFile() ? layout : 'layout.hbs';
    } catch (e){
        layout = 'layout.hbs';
    }

    grunt.registerTask('Compile', 'Compile Handlebars', function() {
        try {
            fs.emptyDirSync(get_file(dist));
        } catch(e){}

        //go through each page.hbs, and compile
        var baseLocation = get_file("content");
        var baseDestination = get_file(dist);
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
                    fs.unlinkSync(get_file("content" + currentDest + hb));
                }
            }

            for (var i = 0; i < hbs.length; i++){
                var hb = hbs[i];
                var page = get_file("content" + currentDest + hb);

                if (fs.lstatSync( page ).isDirectory()){
                    if ( !fs.existsSync( get_file(dist + currentDest + hb) ) ) {
                        fs.mkdirSync( get_file(dist + currentDest + hb) );
                    }

                    LoopFiles(page);
                    continue;
                }

                //split
                var f = hb.split('.');
                var filename = f[0] + (f[2] ? '.' + f[2] : '.html');

                if (f[1] === 'less' || f[2] === 'less'){
                    if (f[0] === 'main' || f[1] === 'main'){
                        var location  = get_file(dist + currentDest + f[0] + '.css');
                        less_files[location] = page;
                    }
                    continue;
                }

                // console.log(f);
                if (f[1] !== 'hbs'){
                    filename = hb;
                    var location = get_file(dist + currentDest + filename);
                    if (init.fileHandler){
                        var action = init.fileHandler[ f[1] ];
                        if (typeof action === 'function'){
                            var out = action(page);
                            if (out){
                                fs.writeFileSync(location, out);
                            }
                        } else if (typeof action === 'string' && action === 'ignore'){
                            console.log('ignoring file ' + filename);
                        } else {
                            fs.copySync(page, location, {});
                        }
                    } else {
                        fs.copySync(page, location, {});
                    }
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
                    page     : page,
                    layout   : layout,
                    hbs      : hbs,
                    data     : page_data
                };

                var pagecontent = fs.readFileSync(page).toString("utf8");
                var p = handlebars.compile(pagecontent);

                data.assets = assets;
                var page_out = p(data);

                handlebars.registerPartial("content", page_out);



                var all = page_data || data || {};
                all.assets = assets;

                var template;
                if (f[2]){
                    template = handlebars.compile('{{> content}}');
                } else {
                    template = handlebars.compile(layoutContent.toString("utf8"));
                }

                var out = template(all);

                //FIXME: we compile 2 times just to parse
                //{{assets}} within global options
                //there must be a better way to do this
                template = handlebars.compile(out);
                out = template({ assets : assets });

                fs.writeFileSync(get_file(dist + currentDest + filename), out);

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
                files: less_files
            }
        },

        watch: {
            files : {
                files: [get_file('content/**/*')],
                tasks: ['Compile', 'less'],
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
    grunt.registerTask('compile', ['Compile', 'less']);
};
