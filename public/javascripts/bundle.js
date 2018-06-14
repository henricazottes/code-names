/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./modules/game/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./modules/game/components/board.pug":
/*!*******************************************!*\
  !*** ./modules/game/components/board.pug ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var pug = __webpack_require__(/*! ../../../node_modules/pug-runtime/index.js */ \"./node_modules/pug-runtime/index.js\");\n\nfunction template(locals) {var pug_html = \"\", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (cards) {pug_html = pug_html + \"\\u003Cdiv class=\\\"ui five column grid\\\"\\u003E\";\n// iterate cards\n;(function(){\n  var $$obj = cards;\n  if ('number' == typeof $$obj.length) {\n      for (var pug_index0 = 0, $$l = $$obj.length; pug_index0 < $$l; pug_index0++) {\n        var row = $$obj[pug_index0];\npug_html = pug_html + \"\\u003Cdiv class=\\\"streched row\\\"\\u003E\";\n// iterate row\n;(function(){\n  var $$obj = row;\n  if ('number' == typeof $$obj.length) {\n      for (var pug_index1 = 0, $$l = $$obj.length; pug_index1 < $$l; pug_index1++) {\n        var card = $$obj[pug_index1];\npug_html = pug_html + \"\\u003Cdiv class=\\\"column\\\"\\u003E\\u003Cdiv class=\\\"ui card\\\"\\u003E\\u003Cdiv\" + (pug.attr(\"class\", pug.classes([`${card.team}-card ${card.isRevealed ? 'revealed' : ''} content game-card`], [true]), false, true)+\" style=\\\"text-align: center; font-weight: bold\\\"\") + \"\\u003E\" + (pug.escape(null == (pug_interp = card.word.fr) ? \"\" : pug_interp)) + \"\\u003C\\u002Fdiv\\u003E\\u003C\\u002Fdiv\\u003E\\u003C\\u002Fdiv\\u003E\";\n      }\n  } else {\n    var $$l = 0;\n    for (var pug_index1 in $$obj) {\n      $$l++;\n      var card = $$obj[pug_index1];\npug_html = pug_html + \"\\u003Cdiv class=\\\"column\\\"\\u003E\\u003Cdiv class=\\\"ui card\\\"\\u003E\\u003Cdiv\" + (pug.attr(\"class\", pug.classes([`${card.team}-card ${card.isRevealed ? 'revealed' : ''} content game-card`], [true]), false, true)+\" style=\\\"text-align: center; font-weight: bold\\\"\") + \"\\u003E\" + (pug.escape(null == (pug_interp = card.word.fr) ? \"\" : pug_interp)) + \"\\u003C\\u002Fdiv\\u003E\\u003C\\u002Fdiv\\u003E\\u003C\\u002Fdiv\\u003E\";\n    }\n  }\n}).call(this);\n\npug_html = pug_html + \"\\u003C\\u002Fdiv\\u003E\";\n      }\n  } else {\n    var $$l = 0;\n    for (var pug_index0 in $$obj) {\n      $$l++;\n      var row = $$obj[pug_index0];\npug_html = pug_html + \"\\u003Cdiv class=\\\"streched row\\\"\\u003E\";\n// iterate row\n;(function(){\n  var $$obj = row;\n  if ('number' == typeof $$obj.length) {\n      for (var pug_index2 = 0, $$l = $$obj.length; pug_index2 < $$l; pug_index2++) {\n        var card = $$obj[pug_index2];\npug_html = pug_html + \"\\u003Cdiv class=\\\"column\\\"\\u003E\\u003Cdiv class=\\\"ui card\\\"\\u003E\\u003Cdiv\" + (pug.attr(\"class\", pug.classes([`${card.team}-card ${card.isRevealed ? 'revealed' : ''} content game-card`], [true]), false, true)+\" style=\\\"text-align: center; font-weight: bold\\\"\") + \"\\u003E\" + (pug.escape(null == (pug_interp = card.word.fr) ? \"\" : pug_interp)) + \"\\u003C\\u002Fdiv\\u003E\\u003C\\u002Fdiv\\u003E\\u003C\\u002Fdiv\\u003E\";\n      }\n  } else {\n    var $$l = 0;\n    for (var pug_index2 in $$obj) {\n      $$l++;\n      var card = $$obj[pug_index2];\npug_html = pug_html + \"\\u003Cdiv class=\\\"column\\\"\\u003E\\u003Cdiv class=\\\"ui card\\\"\\u003E\\u003Cdiv\" + (pug.attr(\"class\", pug.classes([`${card.team}-card ${card.isRevealed ? 'revealed' : ''} content game-card`], [true]), false, true)+\" style=\\\"text-align: center; font-weight: bold\\\"\") + \"\\u003E\" + (pug.escape(null == (pug_interp = card.word.fr) ? \"\" : pug_interp)) + \"\\u003C\\u002Fdiv\\u003E\\u003C\\u002Fdiv\\u003E\\u003C\\u002Fdiv\\u003E\";\n    }\n  }\n}).call(this);\n\npug_html = pug_html + \"\\u003C\\u002Fdiv\\u003E\";\n    }\n  }\n}).call(this);\n\npug_html = pug_html + \"\\u003Cdiv class=\\\"stretched row\\\" id=\\\"endTurn\\\" style=\\\"display: none\\\"\\u003E\\u003Cbutton class=\\\"ui button blue\\\" id=\\\"endTurnButton\\\" style=\\\"margin: auto\\\"\\u003EEnd turn\\u003C\\u002Fbutton\\u003E\\u003C\\u002Fdiv\\u003E\\u003C\\u002Fdiv\\u003E\";}.call(this,\"cards\" in locals_for_with?locals_for_with.cards:typeof cards!==\"undefined\"?cards:undefined));;return pug_html;};\nmodule.exports = template;\n\n//# sourceURL=webpack:///./modules/game/components/board.pug?");

/***/ }),

/***/ "./modules/game/components/nameLine.pug":
/*!**********************************************!*\
  !*** ./modules/game/components/nameLine.pug ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var pug = __webpack_require__(/*! ../../../node_modules/pug-runtime/index.js */ \"./node_modules/pug-runtime/index.js\");\n\nfunction template(locals) {var pug_html = \"\", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (isCaptain, me, name) {pug_html = pug_html + \"\\u003Cdiv class=\\\"item\\\"\\u003E\\u003Cdiv class=\\\"content\\\"\\u003E\";\nif (me) {\npug_html = pug_html + \"\\u003Ci class=\\\"fas fa-caret-right\\\"\\u003E\\u003C\\u002Fi\\u003E\";\n}\npug_html = pug_html + (pug.escape(null == (pug_interp = ` ${name} `) ? \"\" : pug_interp));\nif (isCaptain) {\npug_html = pug_html + \"\\u003Ci class=\\\"fas fa-star\\\" style=\\\"color: #fdcb6e\\\"\\u003E\\u003C\\u002Fi\\u003E\";\n}\npug_html = pug_html + \"\\u003C\\u002Fdiv\\u003E\\u003C\\u002Fdiv\\u003E\";}.call(this,\"isCaptain\" in locals_for_with?locals_for_with.isCaptain:typeof isCaptain!==\"undefined\"?isCaptain:undefined,\"me\" in locals_for_with?locals_for_with.me:typeof me!==\"undefined\"?me:undefined,\"name\" in locals_for_with?locals_for_with.name:typeof name!==\"undefined\"?name:undefined));;return pug_html;};\nmodule.exports = template;\n\n//# sourceURL=webpack:///./modules/game/components/nameLine.pug?");

/***/ }),

/***/ "./modules/game/components/winnerModal.pug":
/*!*************************************************!*\
  !*** ./modules/game/components/winnerModal.pug ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("var pug = __webpack_require__(/*! ../../../node_modules/pug-runtime/index.js */ \"./node_modules/pug-runtime/index.js\");\n\nfunction template(locals) {var pug_html = \"\", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (isWinner, team) {pug_html = pug_html + \"\\u003Cdiv class=\\\"ui modal\\\"\\u003E\\u003Cdiv\" + (pug.attr(\"class\", pug.classes([`content ${team}-team`], [true]), false, true)+\" style=\\\"font-size: 30px; text-align: center\\\"\") + \"\\u003E\" + (pug.escape(null == (pug_interp = isWinner ? 'Your team win! :D' : \"Your team loose... :'(\") ? \"\" : pug_interp)) + \"\\u003C\\u002Fdiv\\u003E\\u003C\\u002Fdiv\\u003E\";}.call(this,\"isWinner\" in locals_for_with?locals_for_with.isWinner:typeof isWinner!==\"undefined\"?isWinner:undefined,\"team\" in locals_for_with?locals_for_with.team:typeof team!==\"undefined\"?team:undefined));;return pug_html;};\nmodule.exports = template;\n\n//# sourceURL=webpack:///./modules/game/components/winnerModal.pug?");

/***/ }),

/***/ "./modules/game/index.js":
/*!*******************************!*\
  !*** ./modules/game/index.js ***!
  \*******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _components_nameLine_pug__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/nameLine.pug */ \"./modules/game/components/nameLine.pug\");\n/* harmony import */ var _components_nameLine_pug__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_components_nameLine_pug__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _components_board_pug__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/board.pug */ \"./modules/game/components/board.pug\");\n/* harmony import */ var _components_board_pug__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_components_board_pug__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _components_winnerModal_pug__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./components/winnerModal.pug */ \"./modules/game/components/winnerModal.pug\");\n/* harmony import */ var _components_winnerModal_pug__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_components_winnerModal_pug__WEBPACK_IMPORTED_MODULE_2__);\n\n\n\n\n\nlocalStorage.debug = ''\n\nconst socket = io()\nconst local = JSON.parse(sessionStorage.getItem('local')) || {}\nconsole.log(\"Local loaded:\", {...local})\nconst currentId = location.href.split('/').reverse()[0]\n\nconst updateCardClickability = () => {\n  if (local.turn === local.user.team) {\n    if (!local.user.isCaptain) {\n      $('.game-card').css('cursor', 'pointer')\n      $('.game-card').click(function(){\n        console.log('==> userChooseCard', this.innerHTML)\n        socket.emit('userChooseCard', this.innerHTML)\n      })\n    }\n    $('#endTurn > button').prop('disabled', false)\n    $('#endTurn > button').click(() => {\n      console.log('==> userEndTurn')\n      socket.emit('userEndTurn')\n    })\n  } else {\n    $('.game-card').css('cursor', 'default')    \n    $('#endTurn > button').prop('disabled', true)\n  }\n}\n\nconst updateEndTurnVisibility = () => {\n  if (local.user.isCaptain) {\n    $('#endTurn').show()\n  } else {\n    $('#endTurn').hide()\n  }\n}\n\n\nsocket.on('turnUpdate', turn => {\n  console.log('<== turnUpdate', turn)\n  $(`.${turn}Turn`).show()\n  $(`.${nextTeam(turn)}Turn`).hide()\n  storeInfos({ turn })\n  updateCardClickability()\n})\n\nsocket.on('winnerUpdate', winner => {\n  console.log('<== winnerUpdate', winner)\n  $('#winnerModal').append(_components_winnerModal_pug__WEBPACK_IMPORTED_MODULE_2___default()({team: local.user.team, isWinner: winner === local.user.team }))  \n  $('#winnerModal > .modal').modal('show')\n})\n\nsocket.on('cardsUpdate', cards => {\n  console.log('<== cardsUpdate', cards)\n  $('#board').empty().append(_components_board_pug__WEBPACK_IMPORTED_MODULE_1___default()({ cards, isCaptain: local.user && local.user.isCaptain }))\n  updateCardClickability()\n  updateEndTurnVisibility()\n  $('.orange-card').css('color', '#ff7675')\n  $('.orange-card.revealed').css({'background-color': '#ff7675', 'color': 'white'})\n\n  $('.blue-card').css('color', '#74b9ff')\n  $('.blue-card.revealed').css({'background-color': '#74b9ff', 'color': 'white'})\n\n  $('.witness-card').css('color', '#fdcb6e')\n  $('.witness-card.revealed').css({'background-color': '#fdcb6e', 'color': 'white'})\n\n  $('.looser-card').css('color', '2d3436')\n  $('.looser-card.revealed').css({'background-color': '#2d3436', 'color': 'white'})\n})\n\nsocket.on('connect', () => {\n  console.log('<== connect')\n  storeInfos({ user: { ...local.user, socketId: socket.id } })\n})\n\nsocket.on('usersUpdate', users => {\n  console.log('<== usersUpdate', users)\n  users.sort((a, b) => a.name > b.name)\n  $(`#blueTeam`).empty()\n  $(`#orangeTeam`).empty()\n\n  users.map((user, i) => {\n    if (user.socketId === local.user.socketId) {\n      storeInfos({ user })\n    }\n    const element = _components_nameLine_pug__WEBPACK_IMPORTED_MODULE_0___default()({\n      name: user.name,\n      me: user.socketId === local.user.socketId,\n      isOnline: user.isOnline,\n      isCaptain: user.isCaptain\n    })\n    $(`#${user.team}Team`).append(element)\n  })\n\n  updateEndTurnVisibility()\n  updateCardClickability()\n})\n\nconst storeInfos = infos => {\n  Object.keys(infos).map(key => local[key] = infos[key])\n  sessionStorage.setItem('local', JSON.stringify(local))\n}\n\nconst nextTeam = (team) => {\n  return team === 'blue' ? 'orange' : 'blue'\n}\n\nconst getJoinHandler = prefix => () => {\n  const name = $(`#${prefix}NameInput`).val()\n  const team = prefix === 'blue' ? 'blue' : 'orange'\n  $('.nameInputWrapper').hide()\n  const user = { name, socketId: socket.id, team }\n  console.log('==> userConnect', user)\n  socket.emit('userConnect', user)\n}\n\n$('#blueJoin').click(getJoinHandler('blue'))\n$('#orangeJoin').click(getJoinHandler('orange'))\n\nif (local.id !== currentId) {\n  storeInfos({id: currentId, user: {}})  \n} else {\n  if (local.user.team) {\n    $('.nameInputWrapper').hide()\n    console.log('==> userReconnect, local.user.socketId')\n    socket.emit('userReconnect', local.user.socketId)\n  }\n}\n\n\n\n\n//# sourceURL=webpack:///./modules/game/index.js?");

/***/ }),

/***/ "./node_modules/pug-runtime/index.js":
/*!*******************************************!*\
  !*** ./node_modules/pug-runtime/index.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar pug_has_own_property = Object.prototype.hasOwnProperty;\n\n/**\n * Merge two attribute objects giving precedence\n * to values in object `b`. Classes are special-cased\n * allowing for arrays and merging/joining appropriately\n * resulting in a string.\n *\n * @param {Object} a\n * @param {Object} b\n * @return {Object} a\n * @api private\n */\n\nexports.merge = pug_merge;\nfunction pug_merge(a, b) {\n  if (arguments.length === 1) {\n    var attrs = a[0];\n    for (var i = 1; i < a.length; i++) {\n      attrs = pug_merge(attrs, a[i]);\n    }\n    return attrs;\n  }\n\n  for (var key in b) {\n    if (key === 'class') {\n      var valA = a[key] || [];\n      a[key] = (Array.isArray(valA) ? valA : [valA]).concat(b[key] || []);\n    } else if (key === 'style') {\n      var valA = pug_style(a[key]);\n      valA = valA && valA[valA.length - 1] !== ';' ? valA + ';' : valA;\n      var valB = pug_style(b[key]);\n      valB = valB && valB[valB.length - 1] !== ';' ? valB + ';' : valB;\n      a[key] = valA + valB;\n    } else {\n      a[key] = b[key];\n    }\n  }\n\n  return a;\n};\n\n/**\n * Process array, object, or string as a string of classes delimited by a space.\n *\n * If `val` is an array, all members of it and its subarrays are counted as\n * classes. If `escaping` is an array, then whether or not the item in `val` is\n * escaped depends on the corresponding item in `escaping`. If `escaping` is\n * not an array, no escaping is done.\n *\n * If `val` is an object, all the keys whose value is truthy are counted as\n * classes. No escaping is done.\n *\n * If `val` is a string, it is counted as a class. No escaping is done.\n *\n * @param {(Array.<string>|Object.<string, boolean>|string)} val\n * @param {?Array.<string>} escaping\n * @return {String}\n */\nexports.classes = pug_classes;\nfunction pug_classes_array(val, escaping) {\n  var classString = '', className, padding = '', escapeEnabled = Array.isArray(escaping);\n  for (var i = 0; i < val.length; i++) {\n    className = pug_classes(val[i]);\n    if (!className) continue;\n    escapeEnabled && escaping[i] && (className = pug_escape(className));\n    classString = classString + padding + className;\n    padding = ' ';\n  }\n  return classString;\n}\nfunction pug_classes_object(val) {\n  var classString = '', padding = '';\n  for (var key in val) {\n    if (key && val[key] && pug_has_own_property.call(val, key)) {\n      classString = classString + padding + key;\n      padding = ' ';\n    }\n  }\n  return classString;\n}\nfunction pug_classes(val, escaping) {\n  if (Array.isArray(val)) {\n    return pug_classes_array(val, escaping);\n  } else if (val && typeof val === 'object') {\n    return pug_classes_object(val);\n  } else {\n    return val || '';\n  }\n}\n\n/**\n * Convert object or string to a string of CSS styles delimited by a semicolon.\n *\n * @param {(Object.<string, string>|string)} val\n * @return {String}\n */\n\nexports.style = pug_style;\nfunction pug_style(val) {\n  if (!val) return '';\n  if (typeof val === 'object') {\n    var out = '';\n    for (var style in val) {\n      /* istanbul ignore else */\n      if (pug_has_own_property.call(val, style)) {\n        out = out + style + ':' + val[style] + ';';\n      }\n    }\n    return out;\n  } else {\n    return val + '';\n  }\n};\n\n/**\n * Render the given attribute.\n *\n * @param {String} key\n * @param {String} val\n * @param {Boolean} escaped\n * @param {Boolean} terse\n * @return {String}\n */\nexports.attr = pug_attr;\nfunction pug_attr(key, val, escaped, terse) {\n  if (val === false || val == null || !val && (key === 'class' || key === 'style')) {\n    return '';\n  }\n  if (val === true) {\n    return ' ' + (terse ? key : key + '=\"' + key + '\"');\n  }\n  if (typeof val.toJSON === 'function') {\n    val = val.toJSON();\n  }\n  if (typeof val !== 'string') {\n    val = JSON.stringify(val);\n    if (!escaped && val.indexOf('\"') !== -1) {\n      return ' ' + key + '=\\'' + val.replace(/'/g, '&#39;') + '\\'';\n    }\n  }\n  if (escaped) val = pug_escape(val);\n  return ' ' + key + '=\"' + val + '\"';\n};\n\n/**\n * Render the given attributes object.\n *\n * @param {Object} obj\n * @param {Object} terse whether to use HTML5 terse boolean attributes\n * @return {String}\n */\nexports.attrs = pug_attrs;\nfunction pug_attrs(obj, terse){\n  var attrs = '';\n\n  for (var key in obj) {\n    if (pug_has_own_property.call(obj, key)) {\n      var val = obj[key];\n\n      if ('class' === key) {\n        val = pug_classes(val);\n        attrs = pug_attr(key, val, false, terse) + attrs;\n        continue;\n      }\n      if ('style' === key) {\n        val = pug_style(val);\n      }\n      attrs += pug_attr(key, val, false, terse);\n    }\n  }\n\n  return attrs;\n};\n\n/**\n * Escape the given string of `html`.\n *\n * @param {String} html\n * @return {String}\n * @api private\n */\n\nvar pug_match_html = /[\"&<>]/;\nexports.escape = pug_escape;\nfunction pug_escape(_html){\n  var html = '' + _html;\n  var regexResult = pug_match_html.exec(html);\n  if (!regexResult) return _html;\n\n  var result = '';\n  var i, lastIndex, escape;\n  for (i = regexResult.index, lastIndex = 0; i < html.length; i++) {\n    switch (html.charCodeAt(i)) {\n      case 34: escape = '&quot;'; break;\n      case 38: escape = '&amp;'; break;\n      case 60: escape = '&lt;'; break;\n      case 62: escape = '&gt;'; break;\n      default: continue;\n    }\n    if (lastIndex !== i) result += html.substring(lastIndex, i);\n    lastIndex = i + 1;\n    result += escape;\n  }\n  if (lastIndex !== i) return result + html.substring(lastIndex, i);\n  else return result;\n};\n\n/**\n * Re-throw the given `err` in context to the\n * the pug in `filename` at the given `lineno`.\n *\n * @param {Error} err\n * @param {String} filename\n * @param {String} lineno\n * @param {String} str original source\n * @api private\n */\n\nexports.rethrow = pug_rethrow;\nfunction pug_rethrow(err, filename, lineno, str){\n  if (!(err instanceof Error)) throw err;\n  if ((typeof window != 'undefined' || !filename) && !str) {\n    err.message += ' on line ' + lineno;\n    throw err;\n  }\n  try {\n    str = str || __webpack_require__(/*! fs */ 0).readFileSync(filename, 'utf8')\n  } catch (ex) {\n    pug_rethrow(err, null, lineno)\n  }\n  var context = 3\n    , lines = str.split('\\n')\n    , start = Math.max(lineno - context, 0)\n    , end = Math.min(lines.length, lineno + context);\n\n  // Error context\n  var context = lines.slice(start, end).map(function(line, i){\n    var curr = i + start + 1;\n    return (curr == lineno ? '  > ' : '    ')\n      + curr\n      + '| '\n      + line;\n  }).join('\\n');\n\n  // Alter exception message\n  err.path = filename;\n  err.message = (filename || 'Pug') + ':' + lineno\n    + '\\n' + context + '\\n\\n' + err.message;\n  throw err;\n};\n\n\n//# sourceURL=webpack:///./node_modules/pug-runtime/index.js?");

/***/ }),

/***/ 0:
/*!********************!*\
  !*** fs (ignored) ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/* (ignored) */\n\n//# sourceURL=webpack:///fs_(ignored)?");

/***/ })

/******/ });