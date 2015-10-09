var Lang;
Lang = (function () {

	var Lang = function (defaultLangfile, defaultLang) {
		var self = this;

		if (typeof(Storage) !== "undefined") {
			self.set_load_lang(self.getsetting('lang', defaultLang), self.getsetting('langfile', defaultLangfile), true);
		} else {
			self.set_load_lang(defaultLang, defaultLangfile, true);
		}
	};

	Array.prototype.contains = function (obj) {
		var i = this.length;
		while (i--) {
			if (this[i] === obj) {
				return true;
			}
		}
		return false;
	}

	Lang.prototype.pack = {};
	Lang.prototype.loadedfiles = [];

	Lang.prototype.loadLangPack = function (callback, myLangFile, isfirst) {
		var self = this;
		if (!self.loadedfiles.contains(myLangFile)) {
			self.loadJSON(function (response) {
				var result = JSON.parse(response);
				if (isfirst == true) {
					self.pack = result;
				} else {
					for (var i = 0; i < result.length; i++) {
						self.pack.push(result[i]);
					}
				}
				localStorage.setItem('langfile', myLangFile);
				callback();
			}, myLangFile);
		} else {
			localStorage.setItem('langfile', myLangFile);
			callback();
		}
	};

	Lang.prototype.set_lang = function (myLang) {
		var self = this;
		var num = 0;
		var oldelem;
		for (var i = 0; i < self.pack.length; i++) {
			if (self.pack[i].lang == myLang) {

				noderesult = document.evaluate(self.pack[i].elem, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

				var thisNode = noderesult.iterateNext();

				if (i != 0) {
					if (self.pack[i].elem == oldelem) {
						num++;
					}
					if (num != 0) {
						for (var x = 0; x < num; x++) {
							thisNode = noderesult.iterateNext();
						}
					} else {
					}

					var child1 = React.createElement('lable', null, self.pack[i].text);

					React.render(child1, thisNode);
				} else {
					var child1 = React.createElement('lable', null, self.pack[i].text);

					React.render(child1, thisNode);
				}
				oldelem = self.pack[i].elem;
			}
		}

		localStorage.setItem('lang', myLang);
	};

	Lang.prototype.set_load_lang = function (myLang, myLangFile, isfirst) {
		var self = this;

		self.loadLangPack(function () {
			if (isfirst == true) {
				var state = document.readyState;

				if (state == 'complete') {
					self.set_lang(myLang);
				}
			} else {
				self.set_lang(myLang);
			}
		}, myLangFile, isfirst);

	};

	Lang.prototype.getsetting = function (setKey, defaultval) {
		return localStorage[setKey] || defaultval;
	};

	Lang.prototype.loadJSON = function (callback, myfile) {
		var self = this;
		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

				self.loadedfiles.push(myfile);
				callback(xmlhttp.responseText);
			}
		};
		xmlhttp.open('GET', myfile, true);
		xmlhttp.overrideMimeType("application/json");
		xmlhttp.setRequestHeader('Content-Type', 'application/json');
		xmlhttp.setRequestHeader('Accept-Encoding', 'gzip');

		xmlhttp.send(null);
	};
	return Lang;
})();
