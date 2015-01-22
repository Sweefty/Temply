# Temply (Beta)

Fast way to prototype your html pages

Temply was created originally to create our [Free HTML Templats](http://sweefty.com/templates) and we thought it might be of a good use for others as well :)

### Component

* [handlebars]
* [Lessc]
* Icons by [fontastic]

### Installation

```sh
$ npm install temply -g
```

To Start a new template/html project, cd to an empty folder where you want to create your files then:

```sh
$ temply init
```

Temply will copy some files and folders to the distination folders, to watch changes while editing sources

```sh
$ temply watch
```

To compile

```sh
$ temply compile
```

By default compiled files will go to the dist folder, to change that, open init.js file and edit

```js
exports.outLocation = '/some/folder';
```

# Font Icons

By default there is no icons set, but we recommend [fontastic] just create an account with them, genereate your desired set of icons, and then extract files in ``assets/css/icons``

#Source Files

## layout.hbs

Default layout which will be shared with all pages, you can modify as needed but keep ``{{> content}}`` partial where ever you want the pages to be compiled.

## init.js

This file contains general Template options

- ``exports.outLocation`` : define compiled files destination
- ``exports.helpers`` : define handlebars helpers
- ``exports.partials`` : define handlebars partials
- ``exports.data`` : general data to use with handlebars template engine

## Dealing with handlebars

handlebars templates are in ``handlebars`` folder, by default index.hbs is there, but you can create as many pages as you want, **ex :** ``about.hbs`` will compile to ``about.html``

Each page can has it own set of options, *will override global options found in init.js ``exports.data`` *,  to set per page options at the top of the handlebars page add a wellformed json inside ``{{#config}}``  ``{{/config}}`` handlebars tags.

```js
{{#config}}
    {
        "title" : "About Page",
        "description" : "This is a description",
        ...
    }
{{/config}}
```

## Dealing with Less CSS

[LESS Elements] is pre installed so you can use it immediately.

Predefined media queries, based on [BareCss] media queries, you can use as the following:

```css
.some-class-selector {
    @media @small { ... }
    @media @medium { ... }
    @media @large { ... }
    @media @xlarge { ... }
}
```

# Free Templates

We already created some free clean HTML Templates using Temply check them out [here](http://sweefty.com/templates).

License
----
MIT

**Free Software by [sweefty.com]**

[jQuery]:http://jquery.com
[Temply]:http://sweefty.com/temply
[Sweefty.com]:http://sweefty.com
[Fontastic]:http://fontastic.me
[BareCss]:http://sweefty.com/bare
[LESS Elements]:http://lesselements.com
[Lessc]:http://lesscss.org
[handlebars]: http://handlebarsjs.com
