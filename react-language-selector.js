var Lang = (function () {

	var Lang = function (defaultLangfile, defaultLang) {
		var self = this;

		if (typeof(Storage) !== "undefined") {
			self.set_load_lang(self.getsetting('lang', defaultLang), self.getsetting('langfile', defaultLangfile), true);
			//localStorage.setItem('langfile', self.getsetting('langfile', defaultLangfile));
		} else {
			self.set_load_lang(defaultLang, defaultLangfile, true);
		}

		//window.onload = function () {
		//if (typeof(Storage) !== "undefined") {
		//	self.setmyLang(self.getsetting('lang', defaultLang));
		//} else {
		//	self.setmyLang(defaultLang);
		//}
		//};
	};

	//Lang.prototype.addedpacks = {};
	Lang.prototype.pack = {};
	Lang.prototype.loadLangPack = function (callback, myLangFile, isfirst) {
		var self = this;
		//TODO: check if the json object is added before.
		self.loadJSON(function (response) {
			var result = JSON.parse(response);
			if (isfirst == true) {
				self.pack = result;
			} else {
				for (var i = 0; i < result.length; i++) {
					self.pack.push(result[i]);
					//var jsonStr = JSON.stringify(self.pack);
				}
			}
			localStorage.setItem('langfile', myLangFile);
			callback();
		}, myLangFile);
	};

	Lang.prototype.set_lang = function (myLang) {
		var self = this;

		for (var i = 0; i < self.pack.length; i++) {
			if (self.pack[i].lang == myLang) {
				var child1 = React.createElement('lable', null, self.pack[i].text);
				React.render(child1, document.evaluate(self.pack[i].elem, document, null, 9, null).singleNodeValue);
			}
		}
		localStorage.setItem('lang', myLang);
	};

	Lang.prototype.set_load_lang = function (myLang, myLangFile, isfirst) {
		var self = this;

		self.loadLangPack(function () {
			if (isfirst == true) {
				document.onreadystatechange = function () {
					var state = document.readyState
						if (state == 'complete') {
							self.set_lang(myLang);
						}
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
		var xmlhttp = new XMLHttpRequest();

		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
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