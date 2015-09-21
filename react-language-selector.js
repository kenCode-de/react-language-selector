var Lang = (function () {

	var Lang = function (defaultLangfile, defaultLang) {
		var self = this;
		self.loadJSON(function (response) {

			self.pack = JSON.parse(response);
		}, defaultLangfile)

		document.onreadystatechange = function () {
			var state = document.readyState
				if (state == 'interactive') {

					
				} else if (state == 'complete') {
					self.setmyLang(defaultLang);
				}
		}
	};

	Lang.prototype.pack = {};
	Lang.prototype.loadLangPack = function (myLangFile) {
		var self = this;

		self.loadJSON(function (response) {
			var result = JSON.parse(response);
			for (var i = 0; i < result.length; i++) {
				self.pack.push(result[i]);

				var jsonStr = JSON.stringify(self.pack);

			}
		}, myLangFile)
	};

	Lang.prototype.setmyLang = function (myLang) {
		var self = this;
		for (var i = 0; i < self.pack.length; i++) {
			if (self.pack[i].lang == myLang) {

				var child1 = React.createElement('lable', null, self.pack[i].text);
				React.render(child1, document.getElementById(self.pack[i].elem));
			}

		}

	};

	Lang.prototype.loadJSON = function (callback, myfile) {

		var xobj = new XMLHttpRequest();
		xobj.overrideMimeType("application/json");
		xobj.open('GET', myfile, true); // Replace 'my_data' with the path to your file
		xobj.onreadystatechange = function () {
			if (xobj.readyState == 4 && xobj.status == "200") {
				// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
				callback(xobj.responseText);
			}
		};
		xobj.send(null);
	};
	return Lang;
})();
