React.LS = (function () {

	var Lang = function (defaultLangfile, defaultLang) {
		var self = this;
		self.dLang = defaultLang;
		self.dLangFile = defaultLangfile;
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
	};

	Lang.prototype.dLangFile = '';
	Lang.prototype.dLang = '';
	Lang.prototype.pack = {};
	Lang.prototype.loadedfiles = [];

	Lang.prototype.ready = function (fn) {
		if (document.readyState != 'loading') {
			fn();
		} else {
			document.addEventListener('DOMContentLoaded', fn);
		}
	};

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

				var noderesult = document.evaluate(self.pack[i].elem, document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);

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

					/*
					 var child1 = React.SHP.createElement(thisNode.outerHTML, self.pack[i].text, null);
					 React.render(child1, thisNode.parentNode);
					 */

					React.SHP.render(thisNode.outerHTML, self.pack[i].text, self.pack[i].attr, true, thisNode.parentNode);

				} else {

					/*
					 var child1 = React.SHP.createElement(thisNode.outerHTML, self.pack[i].text, null);
					 React.render(child1, thisNode.parentNode);
					 */

					React.SHP.render(thisNode.outerHTML, self.pack[i].text, self.pack[i].attr, true, thisNode.parentNode);

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
				self.ready(function () {
					self.set_lang(myLang);
				})
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

		try {
			xmlhttp.open('GET', myfile, true);
			xmlhttp.overrideMimeType("application/json");
			xmlhttp.setRequestHeader('Content-Type', 'application/json');
			xmlhttp.setRequestHeader('Accept-Encoding', 'gzip');
			xmlhttp.send(null);

			xmlhttp.onreadystatechange = function () {
				if (xmlhttp.status == 301 || xmlhttp.status == 302 || xmlhttp.status == 303 || xmlhttp.status == 307 || xmlhttp.status == 308) {

					alert('Redirected');
				}
				else {
					if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {

						self.loadedfiles.push(myfile);
						callback(xmlhttp.responseText);
					}
				}
			};

		}
		catch (e) {
			alert(e);
			self.set_load_lang(self.dLang, self.dLangFile, false);
		}

	};

	Lang.prototype.UI = React.createClass({
		displayName: "ReactLanguageSelectorUI",
		propTypes: {
			items: React.PropTypes.array.isRequired,
			openMode: React.PropTypes.string,
			hoverTimeout: React.PropTypes.number,
			gridColumns: React.PropTypes.oneOfType([
				React.PropTypes.number,
				React.PropTypes.func
			]),
			showFlag: React.PropTypes.bool,
			selectedLang: React.PropTypes.oneOfType([
				React.PropTypes.string,
				React.PropTypes.func
			]),
			onPopupOpening: React.PropTypes.func,
			onPopupOpened: React.PropTypes.func,
			onPopupClosing: React.PropTypes.func,
			onPopupClosed: React.PropTypes.func,
			onLanguageChanged: React.PropTypes.func
		},
		getDefaultProps: function () {
			return {
				gridColumns: 1,
				showFlag: true,
				openMode: 'hover',
				hoverTimeout: 200,
				selectedLang: null,
				onPopupOpening: null,
				onPopupOpened: null,
				onPopupClosing: null,
				onPopupClosed: null,
				onLanguageChanged: null
			};
		},
		getInitialState: function () {
			var itemsProp = this.props.items;
			var selectedLangProp = this.props.selectedLang;
			var selectedLang = null;
			for (var i = 0; i < itemsProp.length; i++) {
				var item = itemsProp[i];
				if (selectedLangProp === item.id) {
					selectedLang = item;
				}
			}
			return {
				popupOpened: false,
				selectedLang: selectedLang ? selectedLang : itemsProp[0],
				closePopupTimeout: -1
			};
		},
		_documentClickHandler: function (evt) {
			this._processEvent({id: 'onPopupClosing'});
			this.setState({popupOpened: false});
			this._processEvent({id: 'onPopupClosed'});
		},
		_documentKeyHandler: function (evt) {
			if (evt.keyCode === 27) {
				this._processEvent({id: 'onPopupClosing'});
				this.setState({popupOpened: false});
				this._processEvent({id: 'onPopupClosed'});
			}
		},
		_processEvent: function (evt) {
			var onPopupOpeningProp = this.props.onPopupOpening;
			var onPopupOpenedProp = this.props.onPopupOpened;
			var onPopupClosingProp = this.props.onPopupClosing;
			var onPopupClosedProp = this.props.onPopupClosed;
			var onLanguageChangedProp = this.props.onLanguageChanged;

			if (evt.id === 'onPopupOpening') {
				if (onPopupOpeningProp) {
					onPopupOpeningProp(this);
				}
			} else if (evt.id === 'onPopupOpened') {
				document.addEventListener('click', this._documentClickHandler);
				document.addEventListener('keydown', this._documentKeyHandler);
				if (onPopupOpenedProp) {
					onPopupOpenedProp(this);
				}
			} else if (evt.id === 'onPopupClosing') {
				document.removeEventListener('click', this._documentClickHandler);
				document.removeEventListener('keydown', this._documentKeyHandler);
				if (onPopupClosingProp) {
					onPopupClosingProp(this);
				}
			} else if (evt.id === 'onPopupClosed') {
				if (onPopupClosedProp) {
					onPopupClosedProp(this);
				}
			} else if (evt.id === 'onLanguageChanged') {
				if (onLanguageChangedProp) {
					onLanguageChangedProp(evt.selectedLang);
				}
			} else if (evt.id === 'clearClosePopupTimeout') {
				if (this.state.closePopupTimeout > -1) {
					clearTimeout(this.state.closePopupTimeout);
					this.state.closePopupTimeout = -1;
				}
			}
		},
		_onLanguageSelected: function (lang, evt) {
			evt.stopPropagation();
			this._processEvent({id: 'clearClosePopupTimeout'});
			this._processEvent({id: 'onPopupClosing'});
			this.setState({selectedLang: lang, popupOpened: false});
			this._processEvent({id: 'onPopupClosed'});
			this._processEvent({id: 'onLanguageChanged', selectedLang: lang});
			return false;
		},
		_onClick: function (evt) {
			evt.stopPropagation();
			if (this.state.popupOpened) {
				this._processEvent({id: 'onPopupClosing'});
				this.setState({popupOpened: false});
				this._processEvent({id: 'onPopupClosed'});
			} else {
				this._processEvent({id: 'onPopupOpening'});
				this.setState({popupOpened: true});
				this._processEvent({id: 'onPopupOpened'});
			}
			return false;
		},
		_onHover: function (enter, evt) {
			var _this = this;
			var hoverTimeoutProp = this.props.hoverTimeout;
			evt.stopPropagation();
			if (enter) {
				this._processEvent({id: 'clearClosePopupTimeout'});
				if (!this.state.popupOpened) {
					this._processEvent({id: 'onPopupOpening'});
					this.setState({popupOpened: true});
					this._processEvent({id: 'onPopupOpened'});
				}
			} else {
				if (this.state.closePopupTimeout < 0) {
					this.state.closePopupTimeout = setTimeout(function () {
						_this._processEvent({id: 'onPopupClosing'});
						_this.setState({popupOpened: false});
						_this._processEvent({id: 'onPopupClosed'});
					}, hoverTimeoutProp);
				}
			}
			return false;
		},
		render: function () {
			var _this = this;
			var itemsProp = this.props.items;
			var openMode = this.props.openMode;
			var gridColumnsProp = this.props.gridColumns;
			var showFlagsProp = this.props.showFlag;
			var langPerColumn = Math.round(itemsProp.length / gridColumnsProp);
			var selectedLang = this.state.selectedLang;
			var popupOpened = this.state.popupOpened;
			var liElements = [];

			var getTableColumns = function () {
				var tableColumns = [];
				for (var i = 0; i < itemsProp.length; i++) {
					var item = itemsProp[i];
					var selectedItemClass = '';
					if (item.id === selectedLang.id) {
						selectedItemClass = 'rlsui-selected-locale';
					}
					if (showFlagsProp) {
						liElements.push(React.createElement("li", null,
							React.createElement("a", {
									className: selectedItemClass,
									title: item.title,
									onClick: _this._onLanguageSelected.bind(_this, item)
								},
								React.createElement("img", {src: item.flagImg, alt: item.flagTitle}), " ", item.name)
						));
					} else {
						liElements.push(React.createElement("li", null,
							React.createElement("a", {
								className: selectedItemClass,
								title: item.title,
								onClick: _this._onLanguageSelected.bind(_this, item)
							}, " ", item.name)
						));
					}
					if (((i + 1) % langPerColumn) === 0) {
						tableColumns.push(React.createElement("td", null,
							React.createElement("ul", null, liElements)
						));
						liElements = [];
					}
				}

				if (liElements.length > 0) {
					tableColumns.push(React.createElement("td", null,
						React.createElement("ul", null, liElements)
					));
					liElements = [];
				}

				return tableColumns;
			};

			var getSelectedLanguage = function () {
				var flagEl = '';
				if (showFlagsProp) {
					flagEl = React.createElement("img", {src: selectedLang.flagImg, alt: selectedLang.flagTitle});
				}
				if (openMode === 'hover') {
					return React.createElement("a", {
						className: "rlsui-selected-locale",
						onMouseEnter: _this._onHover.bind(_this, true),
						onMouseLeave: _this._onHover.bind(_this, false)
					}, flagEl, " ", selectedLang.name);
				} else {
					return React.createElement("a", {
						className: "rlsui-selected-locale",
						onClick: _this._onClick
					}, flagEl, " ", selectedLang.name);
				}
			};

			var getPopup = function () {
				var popupStyles = {};
				if (!popupOpened) {
					popupStyles.display = 'none';
				}
				if (openMode === 'hover') {
					return React.createElement("div", {
							className: "rlsui-language-container-scrollable",
							style: popupStyles,
							onMouseEnter: _this._onHover.bind(_this, true),
							onMouseLeave: _this._onHover.bind(_this, false)
						},
						React.createElement("table", {className: "rlsui-language-container"},
							React.createElement("tbody", null,
								React.createElement("tr", null, getTableColumns())
							)
						)
					);
				} else {
					return React.createElement("div", {
							className: "rlsui-language-container-scrollable",
							style: popupStyles
						},
						React.createElement("table", {className: "rlsui-language-container"},
							React.createElement("tbody", null,
								React.createElement("tr", null, getTableColumns())
							)
						)
					);
				}
			};

			return React.createElement("div", {className: "react-language-selector-ui"}, getSelectedLanguage(), " ", getPopup());
		}
	});

	return Lang;
})();
