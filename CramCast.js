(function() {

	function LexerNode(string, regex, regexs){
		this.string = string;
		this.children = [];
		var childElements;
		if (string) {
			this.matches = string.match(regex);
			childElements = string.split(regex);
		}
		if (!this.matches) {
			this.matches = [];
			childElements = [string];
		}
		if (regexs.length > 0) {
			var nextRegex = regexs[0];
			var nextRegexes = regexs.slice(1);
			for (var i in childElements) {
				this.children.push(new LexerNode(childElements[i], nextRegex, nextRegexes));
			}
		}
		else {
			this.children = childElements;
		}
	}

	LexerNode.prototype.fillArray = function(array){
		for (var i in this.children) {
			var child = this.children[i];
			if (child.fillArray) 
				child.fillArray(array);
			else if (/[^ \t\n\r]+/i.test(child))
				array.push(child);
			if (i < this.matches.length) {
				var match = this.matches[i];
				if (/[^ \t\n\r]+/i.test(match))
					array.push(match);
			}
		}
	};

	LexerNode.prototype.toString = function(){
		var array = [];
		this.fillArray(array);
		return array.toString();
	};

	function Lexer() {
		// Split by numbers, then whitespace, then punctuation
		this.regexs = [/[0-9]*\.[0-9]+|[0-9]+/ig, /[ \t\n\r\—]+/ig];
	}

	Lexer.prototype.lex = function(string){
		var array = [];
		var node = new LexerNode(string, this.regexs[0], this.regexs.slice(1));
		node.fillArray(array);
		return array;
	};

	var lexer = new Lexer();


	var POSdata = {
		prepconj: "ABOUT ABOVE AFTER ALONG ALTHOUGH AMONG AND AROUND AS AT BEFORE BELOW BENEATH BESIDE BETWEEN BEYOND BUT BY DOWN DURING EXCEPT FOR FROM IF IN INTO NEAR NOR OF OFF ON OR OUT OVER ROUND SINCE SO THAN THAT THOUGH THROUGH TILL TO TOWARDS UNDER UNLESS UNTIL UP WHEREAS WHILE WITH WITHIN WITHOUT".split(" "),
		detpron: "A ALL AN ANOTHER ANY ANYBODY ANYTHING BOTH EACH EITHER ENOUGH EVERY EVERYBODY EVERYONE EVERYTHING FEW FEWER HE HER HERS HERSELF HIM HIMSELF HIS I IT ITS ITSELF LESS MANY ME MINE MORE MOST MUCH MY MYSELF NEITHER NO NOBODY NONE NOONE NOTHING OTHER OTHERS OUR OURS OURSELVES SHE SOME SOMEBODY SOMEONE SOMETHING SUCH THAT THE THEIR THEIRS THEM THEMSELVES THESE THEY THIS THOSE US WE WHAT WHICH WHO WHOM WHOSE YOU YOUR YOURS YOURSELF YOURSELVES".split(" ")
	};


	
	var content = [];

	function populate_content(selector) {
		content = [];

		var nodes = [selector];
		if(typeof selector == 'string') {
			nodes = document.querySelectorAll(selector);
		}

		// get content from nodes
		for(var i=0; i<nodes.length;i++) {
			if(nodes[i].innerText && nodes[i].innerText.length) {
				content.push({ text: nodes[i].innerText, type: nodes[i].nodeName });
			}
		}

		// split content
		for(var node in content) {
			var lexed_words = lexer.lex(content[node].text),
				words = [],
				quote_depth = 0,
				last_word = '';

			for(var i in lexed_words) {
				var word = {};
				word.text = lexed_words[i].replace(/^(\W)/, function(m) { word.before = m; return ''; }).replace(/(\W)$/, function(m) { word.after = m; return ''; });
				if(!word.text.length && words[words.length - 1]) {
					words[words.length - 1].after = word.before;
					continue;
				} else if(word.before == '"' || word.before == "'" || word.before == '“' || word.before == '(') {
					quote_depth++;
				}
				if(quote_depth) {
					word.quote_depth = quote_depth;
				}
				if((word.after == '"' || word.after == "'" || word.after == '”' || word.after == ')') && quote_depth > 0) {
					quote_depth--;
				}
				if(POSdata.prepconj.indexOf(word.text.toUpperCase()) > -1) {
					word.pos = 'prepconj';
				} else if(POSdata.detpron.indexOf(word.text.toUpperCase()) > -1) {
					word.pos = 'detpron';
				}

				var ORP = get_ORP(word.text);
				word.pre_ORP = word.text.substring(0,ORP);
				word.ORP = word.text.substring(ORP, ORP+1);
				word.post_ORP = word.text.substring(ORP+1);

				if(typeof last_word != 'string' && !last_word.after && (last_word.text.length + word.text.length < 11)
					&& (word.pos)) {
					var new_word = { text: last_word.text + String.fromCharCode(160) + word.text },
						new_ORP = get_ORP(new_word.text);
					new_word.ORP = new_word.text.substring(new_ORP, new_ORP + 1);
					new_word.pre_ORP = new_word.text.substring(0, new_ORP);
					new_word.post_ORP = new_word.text.substring(new_ORP + 1);
					new_word.after = word.after;
					new_word.before = last_word.before;
					new_word.count = (last_word.count || 1) + 1;
					if(last_word.pos && word.pos) {
						new_word.pos = word.pos;
					}
					if(word.quote_depth) {
						new_word.quote_depth = word.quote_depth;
					}
					words[words.length - 1] = new_word;

					last_word = new_word;
					continue;
				}

				words.push(word);
				last_word = word;
			}
			words[words.length - 1].last = true;
			content[node].words = words;
		}
	}
	function get_ORP(word) {
		var ORP = Math.max(0,Math.round(((word.length / 2) * 0.9) - 1 - Math.floor(word.length / 6)));
		while(!word.substring(ORP, ORP+1).match(/\w/) && ORP > 0) {
			ORP--;
		}
		return ORP;
	}

	// load markup
	var markup = document.createElement('div'),
		css = '#_cramcast_container{display:none;position:fixed;z-index:9000;left:0;right:0;top:0;bottom:0;background-color:rgba(0,0,0,.75)}#_cramcast_container *{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}#_cramcast_container p{margin:0}#_cramcast_panel{width:95%;max-width:960px;margin:2.5% auto;background-color:#fff}#_cramcast_panel li,#_cramcast_panel ul{list-style:none;margin:0;padding:0}#_cramcast_panel button{border:0;padding:0;margin:2px;background-color:#fffdd0;color:#000;width:2em;height:2em;text-align:center;vertical-align:middle}#_cramcast_panel button:hover{background-color:#000;color:#fffdd0;cursor:pointer}#_cramcast_panel p{margin:0;vertical-align:middle}#_cramcast_panel select{padding:.2em}._cramcast_bar{text-align:center;height:2em;position:relative;border:2px solid #000;border-bottom-width:0}._cramcast_bar:last-of-type{border-bottom-width:2px}._cramcast_bar p,._cramcast_bar select{display:inline-block}._cramcast_progress{height:100%;padding:2px}._cramcast_progress p{font-size:1.5em;position:absolute;left:4%;top:.5em;color:#fff;text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,0 0 3px #000;text-align:left}._cramcast_progress p._cramcast_right{text-align:right;left:auto;right:4%}._cramcast_progress:hover{cursor:pointer}._cramcast_progress_inner{height:100%;background-color:#000;-webkit-transition:width .25s ease-in;transition:width .25s ease-in}._cramcast_body{background-color:#fffdd0;white-space:nowrap;border:2px solid #000;border-bottom-width:0;padding:0 1em}._cramcast_body li,._cramcast_body p{font-size:2em}._cramcast_body li span,._cramcast_body p span{display:inline-block;position:relative;height:3em;padding:1em 0}._cramcast_body li span:nth-child(1),._cramcast_body p span:nth-child(1){width:40%;text-align:right}._cramcast_body li span:nth-child(1):after,._cramcast_body li span:nth-child(1):before,._cramcast_body p span:nth-child(1):after,._cramcast_body p span:nth-child(1):before{content:" ";display:block;position:absolute;right:2px;width:2px}._cramcast_body li span:nth-child(1):after,._cramcast_body p span:nth-child(1):after{top:0;height:100%;background-color:#600;z-index:9001}._cramcast_body li span:nth-child(1):before,._cramcast_body p span:nth-child(1):before{top:25%;height:50%;background-color:#fffdd0;z-index:9002}._cramcast_body li span:nth-child(2),._cramcast_body p span:nth-child(2){text-align:left}._cramcast_body li .ORP,._cramcast_body p .ORP{color:red;z-index:9003;position:relative}._cramcast_body ul{opacity:.4}._cramcast_body ul span:nth-child(2):first-letter{color:#400}._cramcast_body p{margin:0;font-size:2.5em}._cramcast_body:after{clear:both;display:block;content:" ";visibility:hidden;height:1px}#_cramcast_font_test{visibility:hidden;position:absolute;width:auto;height:auto}button[data-action="_cramcast_close"]{float:right}';
	markup.innerHTML = '<style type="text/css">' + css + '</style>\
						<div id="_cramcast_container"><div id="_cramcast_panel"><div class="_cramcast_bar"><button type="button" data-action="_cramcast_close">X</button><select class="_cramcast_wpm" name="_cramcast_wpm"></select><p class="_cramcast_wpm"></p></div><div class="_cramcast_body"><ul id="_cramcast_context_before"></ul><p id="_cramcast_content"></p><ul id="_cramcast_context_after"></ul></div><div class="_cramcast_bar"><button type="button" data-action="_cramcast_stop">#</button><button type="button" data-action="_cramcast_section_back">|&lt;</button><button type="button" data-action="_cramcast_glimpse_back">&lt;&lt;</button><button type="button" data-action="_cramcast_playpause">&gt;</button><button type="button" data-action="_cramcast_glimpse_forward">&gt;&gt;</button><button type="button" data-action="_cramcast_section_forward">&gt;|</button></div><div class="_cramcast_bar"><div class="_cramcast_progress" id="_cramcast_progress_section" data-section="0"><div class="_cramcast_progress_inner" style="width:0%"></div><p></p></div></div><div class="_cramcast_bar"><div class="_cramcast_progress" id="_cramcast_progress_total"><div class="_cramcast_progress_inner" style="width:0%"></div><p class="_cramcast_right"></p></div></div></div></div>';
	document.getElementsByTagName('body')[0].appendChild(markup);



	// RAF shim
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(cb) { window.setTimeout(cb, 1000 / 60); }; 
	})();

	var user_wpm = 400,
		user_paused = true,
		current_node = 0,
		current_word = 0,
		current_delay = 0,
		next_delay = 0,
		last_frame = new Date().getTime(),
		total_time = 0,
		total_words = 0,
		elems = {
			container: document.getElementById('_cramcast_container'),

			body: document.querySelector('._cramcast_body'),
			before: document.getElementById('_cramcast_context_before'),
			after: document.getElementById('_cramcast_context_after'),
			content: document.getElementById('_cramcast_content'),
			progress_section: document.getElementById('_cramcast_progress_section'),
			progress_section_inner: document.querySelector('#_cramcast_progress_section ._cramcast_progress_inner'),
			progress_section_text: document.querySelector('#_cramcast_progress_section p'),
			progress_total: document.getElementById('_cramcast_progress_total'),
			progress_total_inner: document.querySelector('#_cramcast_progress_total ._cramcast_progress_inner'),
			progress_total_text: document.querySelector('#_cramcast_progress_total p'),

			select_wpm: document.querySelector('select[name="_cramcast_wpm"]'),
			actual_wpm: document.querySelector('p._cramcast_wpm'),

			button_playpause: document.querySelector('button[data-action="_cramcast_playpause"]'),
			button_stop: document.querySelector('button[data-action="_cramcast_stop"]'),
			button_section_back: document.querySelector('button[data-action="_cramcast_section_back"]'),
			button_section_forward: document.querySelector('button[data-action="_cramcast_section_forward"]'),
			button_glimpse_back: document.querySelector('button[data-action="_cramcast_glimpse_back"]'),
			button_glimpse_forward: document.querySelector('button[data-action="_cramcast_glimpse_forward"]'),
			button_close: document.querySelector('button[data-action="_cramcast_close"]')
		},
		letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
		font_sizes = [];

	function _cramcast_frame() {
		var time = new Date().getTime();

		if(time < last_frame + current_delay + next_delay || user_paused) {
			return requestAnimFrame(_cramcast_frame);
		}
	
		current_delay = 60000/(user_wpm * 1.1);
		next_delay = 0;

		var node = content[current_node],
			word = node.words[current_word];

		if(word.last) {
			current_delay *= 4;
		} else if(word.after && (word.after == '.' || word.after == '?')) {
			current_delay *= 3;
		} else if(word.after) {
			current_delay *= 2.25;
		}
		if(word.pos && (word.pos == 'detpron' || word.pos == 'prepconj')) {
			current_delay *= 0.75;
		}
		if(word.pos && word.count && word.count > 1) {
			current_delay *= 0.75 * (word.count);
		}

		if(word.quote_depth && word.quote_depth % 2) {
			elems.content.style.fontStyle = 'italic';
		} else {
			elems.content.style.fontStyle = 'inherit';
		}

		total_words += word.count || 1;
		total_time += time - last_frame;
		last_frame = time;

		update_ui_elements();

		if(++current_word == node.words.length) {
			current_word = 0;
			if(++current_node == content.length) {
				current_node--;
				current_word = content[current_node].words.length - 1;
				_cramcast_pause();
			}
		}
		requestAnimFrame(_cramcast_frame);
	}
	requestAnimFrame(_cramcast_frame);

	// init UI elements
	for(var i=200; i<=1500; i+=50) {
		var opt = document.createElement('option');
		opt.setAttribute('value', i);
		if(i == user_wpm) {
			opt.setAttribute('selected', 'selected');
		}
		opt.innerHTML = i + ' WPM';
		elems.select_wpm.appendChild(opt);
	}
	function update_ui_elements() {
		var node = content[current_node],
			word = node.words[current_word],
			html = '<span>',
			margin = Math.round(font_sizes[word.ORP]/3);

		if(!font_sizes.m || !font_sizes.l || font_sizes.m == font_sizes.l) {
			calculate_font_sizes();
			margin = 0;
		}
		html += (word.before || "") + word.pre_ORP + '<strong class="ORP" style="margin-right:-' + margin + 'px">' + word.ORP + '</strong></span><span style="padding-left:' + margin + 'px">' + (word.post_ORP || String.fromCharCode(160)) + (word.after || "");
		elems.content.innerHTML = html + '</span>';

		if(content.length > 1) {
			elems.progress_total.parentNode.style.display = 'block';
			elems.progress_total_inner.style.width = Math.round((current_node+1)/content.length * 10000)/100 + '%';
			elems.progress_total_text.innerHTML = Math.round(current_node/content.length * 100) + '%';
		} else {
			elems.progress_total.parentNode.style.display = 'none';
		}
		elems.progress_section_inner.style.width = Math.round((current_word+1)/content[current_node].words.length *10000)/100 + '%';
		elems.actual_wpm.innerHTML = Math.round((total_words / (total_time / 60000))*10)/10 + ' WPM';
	}
	function calculate_font_sizes() {
		// test font sizes
		for(var i=0;i<letters.length;i++) {
			var elem = document.createElement('p');
			elem.setAttribute('id', '_cramcast_font_test');
			elem.innerHTML = letters[i];
			elems.body.appendChild(elem);
			font_sizes[letters[i]] = elem.clientWidth;
			elems.body.removeChild(elem);
		}
	}

	// bind UI elements
	function _cramcast_pause() { user_paused = true; elems.button_playpause.innerHTML = '>'; }
	function _cramcast_play() {
		user_paused = false;
		last_frame = new Date().getTime();
		elems.button_playpause.innerHTML = '||';
	}

	elems.select_wpm.addEventListener('change', function(e) {
		user_wpm = e.target.options[e.target.selectedIndex].value;
		total_time = 1;
		total_words = 0;
	});
	elems.progress_total.addEventListener('click', function(e) {
		var target = Math.floor(((e.x - this.getBoundingClientRect().left) / this.offsetWidth) * content.length);
		current_word = 0;
		current_node = target;
		update_ui_elements();
	});
	elems.button_playpause.addEventListener('click', function(e) {
		if(user_paused) { _cramcast_play();
		} else { _cramcast_pause(); }
	});
	elems.button_section_back.addEventListener('click', function(e) {
		if(current_word < 10 && current_node > 0) {
			current_node--;
		}
		current_word = 0;
		update_ui_elements();
	});
	elems.button_section_forward.addEventListener('click', function(e) {
		if(++current_node >= content.length) {
			current_node--;
			current_word = content[current_node].words.length - 1;
			_cramcast_pause();
		} else {
			current_word = 0;
		}
		update_ui_elements();
	});
	elems.button_glimpse_back.addEventListener('click', function(e) {
		if(current_word < 10) {
			if(current_node > 0) {
				current_word = content[--current_node].length - (10 - current_word);
			} else {
				current_word = 0;
			}
		} else {
			current_word -= 10;
		}
		update_ui_elements();
	});
	elems.button_glimpse_forward.addEventListener('click', function(e) {
		if(current_word + 10 >= content[current_node].words.length) {
			current_word += 10 - content[current_node].words.length;
			if(++current_node == content.length) {
				current_node--;
				current_word = content[current_node].words.length - 1;
				_cramcast_pause();
			}
		} else {
			current_word += 10;
		}
		update_ui_elements();
	});
	elems.button_stop.addEventListener('click', function(e) {
		current_word = 0;
		current_node = 0;
		_cramcast_pause();
		update_ui_elements();
	});
	elems.button_close.addEventListener('click', function(e) {
		_cramcast_pause();
		elems.container.style.display = 'none';
	});
	elems.container.addEventListener('click', function(e) {
		if(e.target == this) {
			_cramcast_pause();
			this.style.display = 'none';
		}
	});

	var content_elems = document.querySelectorAll('h1, h2, h3, h4, h5, p, ul, ol');
	for(var i=0; i<content_elems.length; i++) {
		content_elems[i].addEventListener('click', function(e) {
			populate_content(this);
			current_word = 0;
			current_node = 0;
			next_delay = 500;
			update_ui_elements();
			_cramcast_play();
			elems.container.style.display = 'block';
		});
	}
	
	populate_content('h1, h2, h3, h4, h5, p, ul, ol');
	current_word = 0;
	current_node = 0;
	next_delay = 1000;
	update_ui_elements();
	_cramcast_play();
	elems.container.style.display = 'block';
	

}).call(this);