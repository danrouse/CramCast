(function() {
	// Data definitions
	var _cramcast = {
		settings: {
			wpm: 400,
			wpm_weight: 1.1,
			words_to_skip: 10,
			currency_symbols: ['$'],
			major_punct_symbols: ['.', '?'],
			context_before_length: 12,
			context_after_length: 18,

			delay_last_word: 4,
			delay_major_punct: 3,
			delay_other_punct: 2.25,
			delay_minor_word: 0.75,
			delay_number: 1.5
		}
	};

	var POSdata = {
		prepconj: "ABOUT ABOVE AFTER ALONG ALTHOUGH AMONG AND AROUND AS AT BEFORE BELOW BENEATH BESIDE BETWEEN BEYOND BUT BY DOWN DURING EXCEPT FOR FROM IF IN INTO NEAR NOR OF OFF ON OR OUT OVER ROUND SINCE SO THAN THAT THOUGH THROUGH TILL TO TOWARDS UNDER UNLESS UNTIL UP WHEREAS WHILE WITH WITHIN WITHOUT".split(" "),
		detpron: "A ALL AN ANOTHER ANY ANYBODY ANYTHING BOTH EACH EITHER ENOUGH EVERY EVERYBODY EVERYONE EVERYTHING FEW FEWER HE HER HERS HERSELF HIM HIMSELF HIS I IT ITS ITSELF LESS MANY ME MINE MORE MOST MUCH MY MYSELF NEITHER NO NOBODY NONE NOONE NOTHING OTHER OTHERS OUR OURS OURSELVES SHE SOME SOMEBODY SOMEONE SOMETHING SUCH THAT THE THEIR THEIRS THEM THEMSELVES THESE THEY THIS THOSE US WE WHAT WHICH WHO WHOM WHOSE YOU YOUR YOURS YOURSELF YOURSELVES".split(" ")
	};
	var markup = document.createElement('div'),
		css = '#_cramcast_container{display:none;position:fixed;z-index:9000;left:0;right:0;top:0;bottom:0;background-color:rgba(0,0,0,.75);font-size:100%;font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;font-variant:normal;text-transform:none}#_cramcast_container *{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}#_cramcast_container p{margin:0}#_cramcast_panel{width:95%;max-width:960px;margin:2.5% auto;border:2px solid #000;background-color:#fff}#_cramcast_panel li,#_cramcast_panel ul{list-style:none;margin:0;padding:0}#_cramcast_panel button{border:0;padding:0;margin:3px 0;background-color:#fffdd0;color:#000;width:1.9em;height:1.9em;text-align:center;vertical-align:middle}#_cramcast_panel button[data-action="_cramcast_close"]{margin-right:3px}#_cramcast_panel button span{display:none}#_cramcast_panel button:hover{background-color:#000;color:#fffdd0;cursor:pointer}#_cramcast_panel p{margin:0;vertical-align:middle}#_cramcast_panel select{padding:4px;background-color:#fffdd0}._cramcast_bar{text-align:left;height:2em;position:relative;background-color:#b9b67d}._cramcast_bar p,._cramcast_bar select{display:inline-block}#_cramcast_progress_total{height:1em}#_cramcast_progress_total .cramcast_progress_inner{background-color:rgba(0,0,0,.25)}._cramcast_progress{height:100%;padding:2px}._cramcast_progress p{font-size:1.5em;position:absolute;left:4%;top:.5em;color:#fff;text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,0 0 3px #000;text-align:left}._cramcast_progress p._cramcast_right{text-align:right;left:auto;right:4%}._cramcast_progress:hover{cursor:pointer}._cramcast_progress_inner{height:100%;background-color:#000;-webkit-transition:width .1s ease-in;transition:width .1s ease-in}._cramcast_body{background-color:#fffdd0;white-space:nowrap;border:2px solid #000;border-left-width:0;border-right-width:0;padding:0 1em;position:relative}._cramcast_body li,._cramcast_body p{font-size:2em}._cramcast_body li>span,._cramcast_body p>span{display:inline-block;position:relative;height:3em;padding:1em 0}._cramcast_body li>span span,._cramcast_body p>span span{text-shadow:0 0 5px #000;color:transparent;opacity:.25}._cramcast_body li>span:nth-child(1),._cramcast_body p>span:nth-child(1){width:40%;text-align:right}._cramcast_body li>span:nth-child(1):after,._cramcast_body li>span:nth-child(1):before,._cramcast_body p>span:nth-child(1):after,._cramcast_body p>span:nth-child(1):before{content:" ";display:block;position:absolute;right:2px;width:3px}._cramcast_body li>span:nth-child(1):after,._cramcast_body p>span:nth-child(1):after{top:0;height:100%;background-color:#900;z-index:9001}._cramcast_body li>span:nth-child(1):before,._cramcast_body p>span:nth-child(1):before{top:25%;height:50%;background-color:#fffcb6;z-index:9002}._cramcast_body li>span:nth-child(2),._cramcast_body p>span:nth-child(2){text-align:left}._cramcast_body li .ORP,._cramcast_body p .ORP{color:red;z-index:9003;position:relative;font-weight:400;text-shadow:0 0 2px #fffdd0}._cramcast_body ul{opacity:.4}._cramcast_body ul span:nth-child(2):first-letter{color:#400}._cramcast_body p{margin:0;font-size:2.5em}#_cramcast_font_test{visibility:hidden;position:absolute;width:auto;height:auto}#_cramcast_wpm{position:absolute;right:4px;bottom:2px;font-size:.75em}#_cramcast_button{position:fixed;width:auto;padding:1em;background-color:rgba(255,255,255,.6);color:#000;font-size:1em;bottom:0;right:0;text-align:right;font-style:italic}@font-face{font-family:_cramcast_icons;src:url(data:application/octet-stream;base64,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) format("woff"),url(data:application/octet-stream;base64,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) format("truetype")}button[data-action^="_cramcast_"]:before{font-family:_cramcast_icons;font-style:normal;font-weight:400;speak:none;display:inline-block;text-decoration:inherit;width:1em;text-align:center}button[data-action="_cramcast_playpause"]:before{content:"\\e801"}button[data-action="_cramcast_stop"]:before{content:"\\e802"}button[data-action="_cramcast_playpause"].paused:before{content:"\\e800"}button[data-action="_cramcast_glimpse_forward"]:before{content:"\\e803"}button[data-action="_cramcast_section_back"]:before{content:"\\e806"}button[data-action="_cramcast_glimpse_back"]:before{content:"\\e805"}button[data-action="_cramcast_section_forward"]:before{content:"\\e804"}button[data-action="_cramcast_speed_up"]:before{content:"\\e807"}button[data-action="_cramcast_speed_down"]:before{content:"\\e808"}button[data-action="_cramcast_close"]:before{content:"\\e809"}button[data-action="_cramcast_close"]{float:right}@media screen and (max-width:400px){._cramcast_body p>span span{display:none}}';
	markup.innerHTML = '<style type="text/css">' + css + '</style>\
						<div id="_cramcast_container"><div id="_cramcast_panel"><div class="_cramcast_bar"><select name="_cramcast_wpm"></select><button type="button" data-action="_cramcast_speed_down"><span>Slower</span></button><button type="button" data-action="_cramcast_speed_up"><span>Faster</span></button><button type="button" data-action="_cramcast_stop"><span>Stop</span></button><button type="button" data-action="_cramcast_section_back"><span>Previous Section</span></button><button type="button" data-action="_cramcast_glimpse_back"><span>Rewind 10 words</span></button><button type="button" data-action="_cramcast_playpause"><span>Play/Pause</span></button><button type="button" data-action="_cramcast_glimpse_forward"><span>Skip 10 words</span></button><button type="button" data-action="_cramcast_section_forward"><span>Next Section</span></button><button type="button" data-action="_cramcast_close"><span>Close</span></button></div><div class="_cramcast_body"><p id="_cramcast_wpm"></p><ul id="_cramcast_context_before"></ul><p id="_cramcast_content"></p><ul id="_cramcast_context_after"></ul></div><div class="_cramcast_bar" id="_cramcast_progress_node"><div class="_cramcast_progress"><div class="_cramcast_progress_inner" style="width:0%"></div><p></p></div></div><div class="_cramcast_bar" id="_cramcast_progress_total"><div class="_cramcast_progress"><div class="_cramcast_progress_inner" style="width:0%"></div><p class="_cramcast_right"></p></div></div></div></div><div id="_cramcast_button">CramCast loaded! Click on any text to begin reading.</div>';
	document.getElementsByTagName('body')[0].appendChild(markup);


	// Lexer (modified from jspos) (add credit)
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
		this.regexs = [/[0-9]*[\.,][0-9]+|[0-9]+/ig, /[ \t\n\r\—]+/ig];
	}

	Lexer.prototype.lex = function(string){
		var array = [];
		var node = new LexerNode(string, this.regexs[0], this.regexs.slice(1));
		node.fillArray(array);
		return array;
	};

	var lexer = new Lexer();

	// RAF shim
	window.requestAnimFrame = (function() {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(cb) { window.setTimeout(cb, 1000 / 60); }; 
	})();


	// Content extraction
	var content = [];

	function populate_content(selector) {
		content = [];

		var nodes = [selector];
		if(typeof selector == 'string') {
			nodes = document.querySelectorAll(selector);
		} else if(selector.length && selector.length > 1) {
			nodes = selector;
		}

		// get content from nodes
		for(var i=0; i<nodes.length;i++) {
			if(nodes[i].innerText && nodes[i].innerText.length) {
				nodes[i].setAttribute('data-_cramcast_node', content.length);
				content.push({ text: nodes[i].innerText, type: nodes[i].nodeName });
			}
		}

		// split content
		for(var node in content) {
			var lexed_words = lexer.lex(content[node].text),
				words = [],
				quote_depth = 0,
				last_word = '',
				next_before = '';

			for(var i in lexed_words) {
				var word = {};
				word.text = lexed_words[i].replace(/^(\W)/, function(m) { word.before = m; return ''; }).replace(/(\W)$/, function(m) { word.after = m; return ''; });
				if(!word.text.length && words[words.length - 1]) {
					if(_cramcast.settings.currency_symbols.indexOf(word.before) > -1) {
						next_before = word.before;
					} else {
						words[words.length - 1].after = word.before;
					}
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
				} else if(word.text.match(/\d+[\.,]?\d*[\.,]?\d*[\.,]?\d*/)) {
					word.pos = 'number';
				}

				if(next_before.length) {
					if(_cramcast.settings.currency_symbols.indexOf(next_before) > -1) {
						word.pos = 'number';
					}
					word.before = next_before + (word.before || '');
					next_before = '';
				}
				var ORP = get_ORP(word.text);
				word.pre_ORP = word.text.substring(0,ORP);
				word.ORP = word.text.substring(ORP, ORP+1);
				word.post_ORP = word.text.substring(ORP+1);

				if(typeof last_word != 'string' && !last_word.after && (last_word.text.length + word.text.length < 11) && (
					(word.pos && (word.pos == 'detpron' || word.pos == 'prepconj')) || // content + function
					(last_word.pos && last_word.pos == 'number') // number + content word
					)) {
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
		var ORP = Math.max(0,Math.round((word.length / 2) - 1 - Math.floor(word.length / 5)));
		while(!word.substring(ORP, ORP+1).match(/\w/) && ORP > 0) {
			ORP--;
		}
		return ORP;
	}

	// Display
	_cramcast.status = {
		paused: true,
		node: 0,
		word: 0,
		delay: 0,
		delay_add: 0,
		last_frame_time: new Date().getTime(),
		total_time_played: 0,
		total_words_played: 0,
		font_measurements: {}
	};
	_cramcast.elems = {
		container: document.getElementById('_cramcast_container'),

		body: document.querySelector('._cramcast_body'),
		before: document.getElementById('_cramcast_context_before'),
		after: document.getElementById('_cramcast_context_after'),
		content: document.getElementById('_cramcast_content'),
		progress_node: document.getElementById('_cramcast_progress_node'),
		progress_node_inner: document.querySelector('#_cramcast_progress_node ._cramcast_progress_inner'),
		progress_node_text: document.querySelector('#_cramcast_progress_node p'),
		progress_total: document.getElementById('_cramcast_progress_total'),
		progress_total_inner: document.querySelector('#_cramcast_progress_total ._cramcast_progress_inner'),
		progress_total_text: document.querySelector('#_cramcast_progress_total p'),

		select_wpm: document.querySelector('select[name="_cramcast_wpm"]'),
		actual_wpm: document.getElementById('_cramcast_wpm'),

		button_playpause: document.querySelector('button[data-action="_cramcast_playpause"]'),
		button_stop: document.querySelector('button[data-action="_cramcast_stop"]'),
		button_section_back: document.querySelector('button[data-action="_cramcast_section_back"]'),
		button_section_forward: document.querySelector('button[data-action="_cramcast_section_forward"]'),
		button_glimpse_back: document.querySelector('button[data-action="_cramcast_glimpse_back"]'),
		button_glimpse_forward: document.querySelector('button[data-action="_cramcast_glimpse_forward"]'),
		button_close: document.querySelector('button[data-action="_cramcast_close"]')
	};
	_cramcast.frame = function() {
		var time = new Date().getTime();

		if((time < _cramcast.status.last_frame_time + _cramcast.status.delay + _cramcast.status.delay_add) ||
		   (_cramcast.status.paused)) {
			return requestAnimFrame(_cramcast.frame);
		}

		var node = content[_cramcast.status.node],
			word = node.words[_cramcast.status.word];
	
		_cramcast.status.delay = 60000/(_cramcast.settings.wpm * _cramcast.settings.wpm_weight);
		_cramcast.status.delay_add = 0;

		if(word.last) {
			_cramcast.status.delay *= _cramcast.settings.delay_last_word;
		} else if(word.after && (_cramcast.settings.major_punct_symbols.indexOf(word.after) > -1)) {
			_cramcast.status.delay *= _cramcast.settings.delay_major_punct;
		} else if(word.after) {
			_cramcast.status.delay *= _cramcast.settings.delay_other_punct;
		}
		if(word.pos) {
			if(word.pos == 'detpron' || word.pos == 'prepconj') {
				_cramcast.status.delay *= _cramcast.settings.delay_minor_word;
			} else if(word.pos == 'number') {
				_cramcast.status.delay *= _cramcast.settings.delay_number;
			}
		}
		if(word.pos && word.count && word.count > 1) {
			_cramcast.status.delay *= _cramcast.settings.delay_minor_word * (word.count);
		}

		if(word.quote_depth && word.quote_depth % 2) {
			_cramcast.elems.content.style.fontStyle = 'italic';
		} else {
			_cramcast.elems.content.style.fontStyle = 'inherit';
		}

		_cramcast.status.total_words_played += word.count || 1;
		_cramcast.status.total_time_played += time - _cramcast.status.last_frame_time;
		_cramcast.status.last_frame_time = time;

		update_ui_elements();

		if(++_cramcast.status.word == node.words.length) {
			_cramcast.status.word = 0;
			if(++_cramcast.status.node == content.length) {
				_cramcast.status.node--;
				_cramcast.status.word = content[_cramcast.status.node].words.length - 1;
				_cramcast.pause();
			}
		}
		requestAnimFrame(_cramcast.frame);
	}
	requestAnimFrame(_cramcast.frame);

	function update_ui_elements() {
		var node = content[_cramcast.status.node],
			word = node.words[_cramcast.status.word],
			html = '<span>',
			margin = Math.round(_cramcast.status.font_measurements[word.ORP]/3),
			context_before = '',
			context_after = '';

		if(!_cramcast.status.font_measurements.m || !_cramcast.status.font_measurements.l || _cramcast.status.font_measurements.m == _cramcast.status.font_measurements.l) {
			calculate_font_sizes();
			margin = 0;
		}

		console.log(_cramcast.elems.content.offsetWidth, _cramcast.status.font_measurements.m);

		for(var i=_cramcast.status.word-1;i>_cramcast.status.word-5;i--) {
			if(!node.words[i]) { break; }
			var text = (node.words[i].before || '') + node.words[i].pre_ORP + node.words[i].ORP + node.words[i].post_ORP + (node.words[i].after || '');
			context_before = text + ' ' + context_before;
			if(context_before.length > _cramcast.settings.context_before_length) {
				context_before = context_before.substring(context_before.length - _cramcast.settings.context_before_length);
				break;
			}
		}
		for(var i=_cramcast.status.word+1;i<_cramcast.status.word+5;i++) {
			if(!node.words[i]) { break; }
			var text = (node.words[i].before || '') + node.words[i].pre_ORP + node.words[i].ORP + node.words[i].post_ORP + (node.words[i].after || '');
			context_after += ' ' + text;
			if(context_after.length > _cramcast.settings.context_after_length) {
				context_after = context_after.substring(0, _cramcast.settings.context_after_length);
				break;
			}
		}

		html += '<span>' + context_before + '</span>' + (word.before || "") + word.pre_ORP + '<strong class="ORP" style="margin-right:-' + margin + 'px">' + word.ORP + '</strong></span><span style="padding-left:' + margin + 'px">' + (word.post_ORP || String.fromCharCode(160)) + (word.after || "") + '<span>' + context_after + '</span>';
		_cramcast.elems.content.innerHTML = html + '</span>';

		if(content.length > 1) {
			_cramcast.elems.progress_total.parentNode.style.display = 'block';
			_cramcast.elems.progress_total_inner.style.width = Math.round((_cramcast.status.node+1)/content.length * 10000)/100 + '%';
			//_cramcast.elems.progress_total_text.innerHTML = Math.round(_cramcast.status.node/content.length * 100) + '%';
		} else {
			_cramcast.elems.progress_total.parentNode.style.display = 'none';
		}
		_cramcast.elems.progress_node_inner.style.width = Math.round((_cramcast.status.word+1)/content[_cramcast.status.node].words.length *10000)/100 + '%';
		_cramcast.elems.actual_wpm.innerHTML = Math.round((_cramcast.status.total_words_played / (_cramcast.status.total_time_played / 60000))*10)/10 + ' WPM';
	}
	function calculate_font_sizes(letters) {
		letters = letters || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

		for(var i=0;i<letters.length;i++) {
			var elem = document.createElement('p');
			elem.setAttribute('id', '_cramcast_font_test');
			elem.innerHTML = letters[i];
			_cramcast.elems.body.appendChild(elem);
			_cramcast.status.font_measurements[letters[i]] = elem.clientWidth;
			_cramcast.elems.body.removeChild(elem);
		}
	}

	// bind UI elements
	_cramcast.pause = function() {
		_cramcast.status.paused = true;
		_cramcast.elems.button_playpause.classList.add('paused');
	}
	_cramcast.play = function() {
		_cramcast.status.last_frame_time = new Date().getTime();
		_cramcast.status.paused = false;
		_cramcast.elems.button_playpause.classList.remove('paused');
	}
	_cramcast.set_context_length = function() {
		var ems = _cramcast.elems.content.offsetWidth / _cramcast.status.font_measurements.m;
		_cramcast.settings.context_before_length = Math.round(ems / 2);
		_cramcast.settings.context_after_length = Math.round(ems / 1.5);
	}

	_cramcast.elems.select_wpm.addEventListener('change', function(e) {
		_cramcast.settings.wpm = e.target.options[e.target.selectedIndex].value;
		_cramcast.status.total_time_played = 1;
		_cramcast.status.total_words_played = 0;
	});
	_cramcast.elems.progress_total.addEventListener('click', function(e) {
		var target = Math.floor(((e.x - this.getBoundingClientRect().left) / this.offsetWidth) * content.length);
		_cramcast.status.word = 0;
		_cramcast.status.node = target;
		update_ui_elements();
	});
	_cramcast.elems.progress_node.addEventListener('click', function(e) {
		var target = Math.floor(((e.x - this.getBoundingClientRect().left) / this.offsetWidth) * content.length);
		_cramcast.status.word = 0;
		_cramcast.status.node = target;
		update_ui_elements();
	});
	_cramcast.elems.button_playpause.addEventListener('click', function(e) {
		if(_cramcast.status.paused) { _cramcast.play();
		} else { _cramcast.pause(); }
	});
	_cramcast.elems.button_section_back.addEventListener('click', function(e) {
		if(_cramcast.status.word < _cramcast.settings.words_to_skip && _cramcast.status.node > 0) {
			_cramcast.status.node--;
		}
		_cramcast.status.word = 0;
		update_ui_elements();
	});
	_cramcast.elems.button_section_forward.addEventListener('click', function(e) {
		if(++_cramcast.status.node >= content.length) {
			_cramcast.status.node--;
			_cramcast.status.word = content[_cramcast.status.node].words.length - 1;
			_cramcast.pause();
		} else {
			_cramcast.status.word = 0;
		}
		update_ui_elements();
	});
	_cramcast.elems.button_glimpse_back.addEventListener('click', function(e) {
		if(_cramcast.status.word < _cramcast.settings.words_to_skip) {
			if(_cramcast.status.node > 0) {
				_cramcast.status.word = content[--_cramcast.status.node].length - (_cramcast.settings.words_to_skip - _cramcast.status.word);
			} else {
				_cramcast.status.word = 0;
			}
		} else {
			_cramcast.status.word -= _cramcast.settings.words_to_skip;
		}
		update_ui_elements();
	});
	_cramcast.elems.button_glimpse_forward.addEventListener('click', function(e) {
		if(_cramcast.status.word + _cramcast.settings.words_to_skip >= content[_cramcast.status.node].words.length) {
			_cramcast.status.word += _cramcast.settings.words_to_skip - content[_cramcast.status.node].words.length;
			if(++_cramcast.status.node == content.length) {
				_cramcast.status.node--;
				_cramcast.status.word = content[_cramcast.status.node].words.length - 1;
				_cramcast.pause();
			}
		} else {
			_cramcast.status.word += _cramcast.settings.words_to_skip;
		}
		update_ui_elements();
	});
	_cramcast.elems.button_stop.addEventListener('click', function(e) {
		_cramcast.status.word = 0;
		_cramcast.status.node = 0;
		_cramcast.pause();
		update_ui_elements();
	});
	_cramcast.elems.button_close.addEventListener('click', function(e) {
		_cramcast.pause();
		_cramcast.elems.container.style.display = 'none';
	});
	_cramcast.elems.container.addEventListener('click', function(e) {
		if(e.target == this) {
			_cramcast.pause();
			this.style.display = 'none';
		}
	});
	window.onresize = _cramcast.set_context_length;

	// Initialize
	for(var i=200; i<=1500; i+=50) {
		var opt = document.createElement('option');
		opt.setAttribute('value', i);
		if(i == _cramcast.settings.wpm) {
			opt.setAttribute('selected', 'selected');
		}
		opt.innerHTML = i + ' WPM';
		_cramcast.elems.select_wpm.appendChild(opt);
	}

	var content_selector = ['p', 'ol', 'ul', 'div.detail-body'],
		header_selector = ['h1', 'h2', 'h3', 'h4', 'h5'];

	populate_content(content_selector.join(',') + ',' + header_selector.join(','));

	var content_elems = document.querySelectorAll('[data-_cramcast_node]');

	for(var i=0; i<content_elems.length; i++) {
		content_elems[i].addEventListener('click', function(e) {
			_cramcast.begin(this.getAttribute('data-_cramcast_node'));
		});
	}
	
	_cramcast.begin = function(target) {
		_cramcast.set_context_length();
		_cramcast.status.word = 0;
		_cramcast.status.node = parseInt(target);
		_cramcast.status.delay_add = 500;
		update_ui_elements();
		_cramcast.play();
		_cramcast.elems.container.style.display = 'block';
	}

}).call(this);