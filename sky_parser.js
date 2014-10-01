//==================================================
//
//                  Sky Parser 1.1 - an HTML generator inspired by Emmet
//                                                   Made by IliaSky
//	                 skysite.free.bg     www.github.com/IliaSky     si1.free.bg
//
//==================================================

//                                     INSTALL INSTRUCTIONS
// In this order:
//   1. <script type="text/javascript" src="sky_parser.js"></script>
//   2. Write your S.CONST patterns
//   3. Enjoy your S.parse(pattern, object)
//   Note: even without step 2 you can use S.wrap(html, selector)

// Upgrade note - the next version will probably not be backwards compatible
// as it will probably change the interface


//                                     PATTERN INSTRUCTIONS
//
// $.CONST = inserts model from S.CONST
// tag#id.class
	// #this.will.be.a.div.if.there.is.no.tag
// tag + tag
// element[text without html elements]
	// span[This content will be displayed in a span tag]
	// note[text inside square brackets is the only place where space matters]
	// [if tag, id and class are all missing then the text will be in a text node]
// tag(attribute:value)         tag(attr:val, attr:val)
	// a(href:#)[click me] + input(type: number, value: 5)
// outer-tag > inner-tag      outer{ inner + inner }
	// section{ h1[title] + atricle[content] }
// @var = inserts variable from current data object
// @(var){markup} = changes current object to object.var inside the brackets
// *markup = repeats the markup for each element in the current object (array)


// Real world example patterns

/*
S.CONST = {
	ID : "data-id:@id",
	RENT_RETURN : "div.rent-return > button.return-movie($.ID)[Return]+button.rent-movie($.ID)[Rent]",

	STORE : "a.store(href:#info/@id)[@title]",
	CATEGORY : "a.category(href:#category-info/@id,title:@name)[@name]",
	ACTOR : "a.actor(href:#actor-info/@id,title:@firstName_@lastName)[@firstName @lastName]",
	MOVIE : "h1{a.movie(href:#movie-info/@id)[@title]} + span.date[from @publishDate] +$.RENT_RETURN +article[@description]",

	STORES : "section#stores > h1[Stores] + nav > *$.STORE",
	CATEGORIES : "section#categories > h1[Categories] + nav > *$.CATEGORY",
	ACTORS : "section#actors > h1[Actors] + nav> *$.ACTOR",
	MOVIES : "ul#movies > *li > section > $.MOVIE",

	STORE_INFO : "section#store-info > h1{$.STORE} + @(movies){$.MOVIES}",
	CATEGORY_INFO : "section#category-info > h1{$.CATEGORY} + @(movies){$.MOVIES}",
	ACTOR_INFO : "section#actor-info > h1{$.ACTOR} + @(movies){$.MOVIES}",
	MOVIE_INFO : "div#movie-info >  @(actors){$.ACTORS} + section#movie-basic-info{$.MOVIE}+ $(categories){$.CATEGORIES} + @(stores){$.STORES}",

	USERNAME: "label(for:username)[Username]+input#username(type:text,required)",
	PASSWORD: "label(for:password)[Password]+input#password(type:password,required)",
	PASSWORD_AGAIN: "label(for:password-again)[Password Again]+input#password-again(type:password,required)",
	SUBMIT: "input(type:submit)",
	LOGIN : 	  "form#login-form > $.USERNAME + $.PASSWORD + $.SUBMIT",
	REGISTER : "form#register-form> $.USERNAME + $.PASSWORD + $.PASSWORD_AGAIN + $.SUBMIT",

	FIND_CATEGORY : "form#search-form> label(for:search)[Search Categories]+input#search(placeholder:Search,list:search-data-list) + input(type:submit,value:Search) + datalist#search-data-list > *option(value:$name,$.ID)",

	ALL_CATEGORIES : "$.FIND_CATEGORY + $.CATEGORIES"
};

*/

//==============================================
var S = {};
S.CONST = {};

S.REGEX = {
	SIMPLE_SELECTOR : '([\\-_a-z0-9@.#(:/,)$]*)',
	INNER_ELEMENTS : '(?:\\{([-_a-z0-9.#(:,)@$\\[\\] +*{}/]*)\\})?',
	TEXT_NODE : '(?:\\[([-_a-z0-9@$ ]*)\\])?',
	SELECTOR_AND_CONTENT : function(){ return S.REGEX.SIMPLE_SELECTOR + S.REGEX.TEXT_NODE + S.REGEX.INNER_ELEMENTS; },

	TAG    : '^([-_a-z0-9$]*)',
	ID      : '(?:#([-_a-z0-9$]*))?',
	CLASS : '([-._a-z0-9$]*)',
	ATTR  : '(?:\\(([-_a-z0-9@$:,#/]*)\\))?',
	SELECTOR: function(){ return this.TAG + S.REGEX.ID + S.REGEX.CLASS + S.REGEX.ATTR; }
};

S.greaterThanToBrackets = function (str){
	return str.split('>').join('{')+ new Array(str.split('>').length).join('}');
};
S.deconstify = function (str){
	for (i in S.CONST){
		var regex = RegExp('\\$\\.'+i+'(?=([^_a-z]|$))','gi');
		if (str.match(regex))
			str = str.replace(regex, S.deconstify(S.greaterThanToBrackets(S.CONST[i])));
	}
	return str;
};
S.parse = function (str, obj){
	var i, value = "", unclosedBrackets=0;

	// Change a>b+c>d+e to a{b+c{d+e}}
	str = S.deconstify(str);
	str = S.greaterThanToBrackets(str);

	// Remove all whitespace except for spaces inside []
	str = str.replace(/ (?=[^\[]*\])/g,'&nbsp;').replace(/[\s]/g,'').replace(/&nbsp;/g,' ');

	// If the pattern begins with * then returns the sum of the pattern filled with each element in the array(obj)
	if (str[0]=='*')
		return obj.map(function(x){ return S.parse(str.substr(1), x); }).join('');

	// Parse both sides of '+', not inside {} using recursion
	for(i=0;i<str.length;i++){
		unclosedBrackets += (str[i]=='{') - (str[i]=='}');
		if (unclosedBrackets===0 && str[i]=='+')
			return S.parse(str.substr(0,i), obj) + S.parse(str.substr(i+1), obj);
	}

	// Change current object to object.innerObject when @(innerObject){}
	var m = str.match(/^@\(([_a-z]+)\)\{(.*)\}/i);
	if (m)
		return S.parse(m[2],obj[m[1]]);

	// Parse simple selector and content
	m = str.match(RegExp(S.REGEX.SELECTOR_AND_CONTENT(),'i'));
	var selector = m[1];
	var text     = (m[2] || '') + (m[3] ? S.parse(m[3], obj) : '');
	value = S.wrap(text, selector);

	// change @var with object.var
	for (i in obj)
		value = value.replace(RegExp('@'+i,'gi'), obj[i]);

	// change @@ with object
	value = value.replace(/@@/gi, obj);
	return value;
};

S.wrap = function (html, selector){
	var m = selector.match(RegExp(S.REGEX.SELECTOR(),'i'));

	var tag = m[1];
	var id = m[2];
	var klass = m[3].substr(1).split('.').join(' ');
	var attr = (m[4] || '').split(',').map(function(kv){ return kv.split(':'); });

	// set href of anchor tag to # if missing
	var attrNames = attr.map(function(kv){ return kv[0] });
	if (tag == 'a' && attrNames.indexOf('href') == -1)
		attr.push(['href','#']);

	// return text node if there is no selector
	if (tag == "" && id == "" && klass == "")
		return html;

	// make div the default tag
	tag = tag || 'div';

	// create text of opening tag
	var text = tag + S.attr('id',id) + S.attr('class',klass) + S.multipleAttributes(attr);

	// create self closing tag
	var SELF_CLOSING_TAGS = "area base br col hr img input link meta param command keygen source".split(' ');
	if (SELF_CLOSING_TAGS.indexOf(tag) != -1)
		return "<" + text +" />";

	// create normal tag
	return "<" + text +">" + html + "</" + tag +">";
};

S.multipleAttributes = function (array){
	return array.map(function(kv){ return S.attr(kv[0], kv[1]); }).join('');
}
S.attr = function (key,value){
	var BOOLEAN_ATTRIBUTES = "async autofocus autoplay checked controls default defer disabled formnovalidate hidden ismap loop multiple muted novalidate open readonly required reversed scoped seamless selected truespeed typemustmatch".split(' ')
	if (value===undefined || value===''){
		if (BOOLEAN_ATTRIBUTES.indexOf(key) != -1)
			return ' ' + key;
		return '';
	}
	return ' ' + key + '="' + value + '"';
};

function a(arg){
	document.write(S.wrap(JSON.stringify(arg),'xmp')+"<br><br>");
}
function b(arg){
	alert(JSON.stringify(arg));
}

/***** indexOf and map for Older IE **********/
if(!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(needle) {
		for (var i = this.length - 1; i >= 0; i--)
			if(this[i] === needle)
				return i;
	return -1;
	};
}
if (!Array.prototype.map) {
  Array.prototype.map = function(func) {
		var output = [];
		for(var i in array)
			output[i] = func(array[i]);
		return output;
	};
}