Sky Generator
==============================================================================
A small front-end framework inspired by Emmet

`table > tr { th[Name] + th[Age] } + *tr > td[@name] + td[@age]`

Currently supports parsing syntax similar to the one above and generating html
It is still under developement

USAGE INSTRUCTIONS
------------------------------------------------------------------------------
This file will export the global variable SG

__API__:
* SG(pattern, object)
* SG.wrap(html, selector)

__Config__:
*  SG.VIEWS &rarr; your views (patterns or templates)
*  SG.FLAGS &rarr; flags allow minor conditional logic inside the templates
*  SG.FILTERS &rarr; you can apply them when interpolating attributes and switching objects. By default:
    * 'default' is used when interpolating object attributes
    * 'safe' is used when switching objects

Although it is not recommended you can also alter:
* SG.REGEX &rarr; regexes used in the script - alter at your own risk
* SG.SELF_CLOSING_TAGS and SG.BOOLEAN_ATTRIBUTES &rarr; change them if you want


PATTERN INSTRUCTIONS
------------------------------------------------------------------------------

### Basic syntax

* `tag#id.class`
  * `#this.will.be.a.div.if.there.is.no.tag`
* `tag + tag`
* `element[text without html elements]`
  * `span[This content will be displayed in a span tag]`
  * `note[text inside square brackets is the only place where space matters]`
  * `[if tag, id and class are all missing then this will be in a text node]`
* `tag(attribute:value)`
  * `a(href:#)[click me] + input(type: number, value: 5)`
* `outer-tag > inner-tag`    or  `outer{ inner + inner }`
  * `section{ h1[title] + atricle[content] }`

### Advanced syntax

* `$.VIEW` &rarr; inserts view pattern from SG.VIEWS
* `@var` &rarr; inserts variable from current data object
* `@@` &rarr; inserts the value of the current object
* `@(var){markup}` &rarr; changes current object to object.var inside the brackets
* `?(flag){markup}` &rarr; renders markup if flag is on
* `@(var|f){}, @var|f, @@|f` &rarr; Also applies the filter f from SG.FILTERS
* `*markup` &rarr; repeats the markup for each element in the current object (array)

Support & compatibility
------------------------------------------------------------------------------
Currently there are no external dependencies and it will probably stay that way.

The code uses a minimum of new ES features, so that it can work on even IE 6 & 7.

It has been tested on IE 7 and might also work on IE 6.

It does however contain polyfills for array#indexOf and array#map, meaning that
on old browsers there could be problems if any code uses a for in loop to iterate
over an array without checking for own properties.

Performance
------------------------------------------------------------------------------
There are currently no benchmark tests.

However the initial version was able to render the expected results in about 2
seconds for an array with over 2000 elements.

Todo
------------------------------------------------------------------------------
* Escaping
* Router and helpers
* API for settings
* module.exports
* Recursive view import
* Compile (optimise) view option
* Scopes & data binding
* Better demo
* Tests
* Better errors
* Warnings
* Refactor

## Issues
* trying to add invalid symbols in selectors with data object