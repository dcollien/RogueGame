/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
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
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _RogueGame = __webpack_require__(1);
	
	var _RogueGame2 = _interopRequireDefault(_RogueGame);
	
	var _Constants = __webpack_require__(5);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var OL = window.OL;
	var getEl = function getEl(id) {
	  return document.getElementById(id);
	};
	
	var uploadFile = function uploadFile(file, url, onLoad, onError) {
	  var xhr = new XMLHttpRequest();
	
	  xhr.onload = onLoad;
	  xhr.onerror = onError;
	
	  xhr.open('PUT', url);
	  xhr.overrideMimeType(file.type);
	  xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
	  xhr.setRequestHeader('Access-Control-Expose-Headers', 'Access-Control-Allow-Origin');
	  xhr.send(file);
	};
	
	var init = function init() {
	  var artStyles = [];
	  var selectedStyle = 0;
	  if (OL) {
	    OL.resize(720, true);
	    OL.on('resize', function () {
	      window.onresize();
	    });
	    // Running as OpenLearning widget
	    var map = void 0;
	    var spriteSheets = [{
	      name: 'Robot in the Wilderness',
	      url: 'assets/sprites.png'
	    }, {
	      name: 'I drew this in MS Paint',
	      url: 'assets/sprites2.png'
	    }];
	
	    if (OL.mode === 'exhibit') {
	      map = OL.exhibit.data.map;
	      spriteSheets = OL.exhibit.data.sprites;
	      selectedStyle = OL.exhibit.data.selectedStyle || 0;
	    } else if (OL.user.data) {
	      map = OL.user.data.map;
	      spriteSheets = spriteSheets.concat(OL.user.data.sprites || []);
	      selectedStyle = OL.user.data.selectedStyle || 0;
	
	      var shareButton = getEl('editor-share');
	      shareButton.style.display = '';
	      shareButton.onclick = function () {
	        var mapVal = getEl('edit-text').value;
	        var rows = mapVal.trim().split('\n');
	
	        if (rows.length === 0) {
	          alert('Please enter a map to share');
	          return;
	        }
	
	        var tempCanvas = document.createElement('canvas');
	        var tmpCtx = tempCanvas.getContext('2d');
	        var size = 14;
	
	        tmpCtx.fillStyle = 'black';
	        tmpCtx.font = size + 'px monospace';
	        var bounds = tmpCtx.measureText(rows[0]);
	        tempCanvas.width = bounds.width;
	        var ySize = Math.floor(bounds.width / rows[0].length);
	        tempCanvas.height = rows.length * ySize;
	        tmpCtx.font = size + 'px monospace';
	
	        rows.forEach(function (row, i) {
	          tmpCtx.fillText(row, 0, i * ySize);
	        });
	        var thumbnail = tempCanvas.toDataURL();
	
	        OL.user.share('widget', {
	          thumbnail: thumbnail,
	          map: mapVal,
	          sprites: artStyles,
	          selectedStyle: selectedStyle
	        });
	      };
	    }
	
	    if (map) {
	      getEl('edit-text').value = map;
	    }
	
	    if (spriteSheets && spriteSheets.length > 0) {
	      artStyles = spriteSheets;
	    }
	  }
	
	  var artStylesSelect = getEl('theme');
	  artStyles.forEach(function (style, i) {
	    var option = document.createElement('option');
	    option.text = style.name;
	    option.value = style.url;
	    artStylesSelect.appendChild(option);
	  });
	
	  if (OL && OL.mode === 'display') {
	    (function () {
	      var customOption = document.createElement('option');
	      customOption.text = 'Custom: Upload your own';
	      customOption.value = 'CUSTOM';
	      artStylesSelect.appendChild(customOption);
	
	      var uploadButton = getEl('theme-save');
	      uploadButton.onclick = function () {
	        var file = getEl('theme-file').files[0];
	
	        if (file) {
	          uploadButton.dataset.loading = 'true';
	          OL.files.create('sprites.png', function (response) {
	            var storageKey = response.storageKey;
	            var uploadURL = response.uploadURL;
	            uploadFile(file, uploadURL, function () {
	              OL.files.getURLs([storageKey], function (urls) {
	                uploadButton.dataset.loading = 'false';
	                var newStyle = {
	                  name: getEl('theme-name').value,
	                  url: urls[0]
	                };
	                artStyles.unshift(newStyle);
	                var newOption = document.createElement('option');
	                newOption.text = newStyle.name;
	                newOption.value = newStyle.url;
	                artStylesSelect.insertBefore(newOption, artStylesSelect.firstChild);
	                artStylesSelect.value = newStyle.url;
	                selectedStyle = 0;
	                getEl('theme-upload').style.display = 'none';
	              });
	            });
	          });
	        }
	      };
	    })();
	  }
	
	  artStylesSelect.onchange = function (evt) {
	    var selected = evt.target;
	    if (selected.selectedIndex >= artStyles.length) {
	      getEl('theme-upload').style.display = '';
	      getEl('theme-name').value = '';
	    } else {
	      getEl('theme-upload').style.display = 'none';
	      selectedStyle = selected.selectedIndex;
	    }
	  };
	
	  artStylesSelect.value = artStyles[selectedStyle].url;
	
	  var isEditorOpen = false;
	
	  var gameState = getEl('edit-text').value;
	
	  var canvas = getEl('gameCanvas');
	  var spriteSheet = artStyles[selectedStyle].url;
	  var log = '';
	  var updateLog = function updateLog() {
	    var logDisplay = getEl('log');
	    logDisplay.innerText = log.trim();
	    logDisplay.scrollTop = logDisplay.scrollHeight;
	  };
	
	  var onChange = function onChange(grid, inventory, visited, isGameOver, message, windowStr) {
	    getEl('agent-window').innerText = windowStr;
	
	    var inventoryItems = [{
	      id: 'key',
	      symbol: _Constants.InventoryTypes.Key
	    }, {
	      id: 'stone',
	      symbol: _Constants.InventoryTypes.Stone
	    }, {
	      id: 'axe',
	      symbol: _Constants.InventoryTypes.Axe
	    }, {
	      id: 'gold',
	      symbol: _Constants.InventoryTypes.Gold
	    }, {
	      id: 'raft',
	      symbol: _Constants.InventoryTypes.Raft
	    }, {
	      id: 'dynamite',
	      symbol: _Constants.InventoryTypes.Dynamite
	    }];
	
	    inventoryItems.forEach(function (item) {
	      var element = getEl(item.id);
	      var count = 0;
	      inventory.forEach(function (inventoryItem) {
	        if (inventoryItem === item.symbol) {
	          count++;
	        }
	      });
	
	      if (count > 0) {
	        element.style.display = '';
	        if (count > 1) {
	          element.innerText = count;
	        } else {
	          element.innerText = '';
	        }
	      } else {
	        element.style.display = 'none';
	      }
	    });
	
	    if (message || isGameOver) {
	      log += message + '\n';
	      if (isGameOver) {
	        log += 'Game Over.\n\n';
	      }
	
	      updateLog();
	    }
	  };
	
	  var game = new _RogueGame2.default(canvas, gameState, spriteSheet, onChange);
	  var gridWorld = game.gridWorld;
	
	  var initIcons = function initIcons() {
	    var inventoryIcons = Array.from(getEl('inventory').getElementsByTagName("LI"));
	    var iconPositions = {
	      axe: [0, 0],
	      key: [2, 2],
	      dynamite: [6, 0],
	      raft: [3, 3],
	      gold: [7, 0]
	    };
	    var gridSize = 64;
	    var gridWidth = 8;
	    var media = window.matchMedia("(max-width: 480px)");
	    inventoryIcons.forEach(function (icon) {
	      var pos = iconPositions[icon.id];
	      var size = media.matches ? 32 : 64;
	
	      if (pos) {
	        icon.style.backgroundImage = 'url("' + spriteSheet + '")';
	        icon.style.backgroundSize = size * gridWidth + 'px';
	        icon.style.backgroundPosition = -pos[0] * size + 'px ' + -pos[1] * size + 'px';
	      }
	    });
	  };
	  initIcons();
	
	  var actionButtons = {
	    l: getEl('action-l'),
	    r: getEl('action-r'),
	    f: getEl('action-f'),
	    c: getEl('action-c'),
	    u: getEl('action-u'),
	    b: getEl('action-b')
	  };
	
	  var actionHandler = function actionHandler(action) {
	    return function (e) {
	      return game.performAction(action);
	    };
	  };
	
	  Object.keys(actionButtons).forEach(function (key) {
	    actionButtons[key].onclick = actionHandler(key);
	  });
	
	  window.onblur = function () {
	    return gridWorld.stop();
	  };
	  window.onfocus = function () {
	    return gridWorld.run();
	  };
	  window.onresize = function () {
	    return gridWorld.hasModified = true;
	  };
	  window.onkeydown = function (e) {
	    if (isEditorOpen) return;
	    if (document.activeElement.tagName === 'INPUT') return;
	
	    var speed = 8;
	    switch (e.keyCode) {
	      case 38:
	        gridWorld.pan(0, -speed);break;
	      case 40:
	        gridWorld.pan(0, speed);break;
	      case 37:
	        gridWorld.pan(-speed, 0);break;
	      case 39:
	        gridWorld.pan(speed, 0);break;
	      case 'L'.charCodeAt(0):
	        game.performAction('l');break;
	      case 'R'.charCodeAt(0):
	        game.performAction('r');break;
	      case 'F'.charCodeAt(0):
	        game.performAction('f');break;
	      case 'C'.charCodeAt(0):
	        game.performAction('c');break;
	      case 'U'.charCodeAt(0):
	        game.performAction('u');break;
	      case 'B'.charCodeAt(0):
	        game.performAction('b');break;
	
	      case 'A'.charCodeAt(0):
	        game.performAction('l');break;
	      case 'D'.charCodeAt(0):
	        game.performAction('r');break;
	      case 'W'.charCodeAt(0):
	        game.performAction('f');break;
	      case 'Q'.charCodeAt(0):
	        game.performAction('c');break;
	      case 'E'.charCodeAt(0):
	        game.performAction('u');break;
	      case 'S'.charCodeAt(0):
	        game.performAction('b');break;
	
	      case '0'.charCodeAt(0):
	        game.revealMap();break;
	      default:
	        break;
	    }
	  };
	
	  var dragStart = null;
	  var startDrag = function startDrag(clientX, clientY) {
	    var rect = canvas.getBoundingClientRect();
	    dragStart = {
	      x: clientX - rect.left,
	      y: clientY - rect.top,
	      rect: rect
	    };
	    gridWorld.startDrag(dragStart.x, dragStart.y);
	  };
	  var endDrag = function endDrag() {
	    dragStart = null;
	  };
	  var moveDrag = function moveDrag(clientX, clientY) {
	    if (dragStart) {
	      gridWorld.moveDrag(clientX - dragStart.rect.left, clientY - dragStart.rect.top);
	    }
	  };
	  window.onmouseup = function (e) {
	    endDrag();
	  };
	  window.onmousemove = function (e) {
	    moveDrag(e.clientX, e.clientY);
	  };
	  canvas.onmousedown = function (e) {
	    startDrag(e.clientX, e.clientY);
	  };
	  canvas.addEventListener('touchstart', function (e) {
	    e.preventDefault();
	    var touch = e.changedTouches[0];
	    if (!touch) return;
	    startDrag(touch.clientX, touch.clientY);
	  });
	  canvas.addEventListener('touchend', function (e) {
	    endDrag();
	  });
	  canvas.addEventListener('touchcancel', function (e) {
	    endDrag();
	  });
	  canvas.addEventListener('touchmove', function (e) {
	    e.preventDefault();
	    var touch = e.changedTouches[0];
	    if (!touch) return;
	    moveDrag(touch.clientX, touch.clientY);
	  });
	
	  var closeEditor = function closeEditor() {
	    getEl('editor').style.display = 'none';
	    isEditorOpen = false;
	  };
	  var openEditor = function openEditor() {
	    if (OL) OL.user.logInteraction();
	
	    getEl('editor').style.display = '';
	    isEditorOpen = true;
	  };
	
	  getEl('close-editor').onclick = closeEditor;
	  getEl('edit').onclick = openEditor;
	
	  var loadMap = function loadMap() {
	    gameState = getEl('edit-text').value;
	    var theme = getEl('theme').value;
	
	    if (theme === 'CUSTOM') {
	      alert("No theme uploaded.");
	    } else {
	      try {
	        spriteSheet = theme;
	        gridWorld.changeSprites(theme);
	        initIcons();
	        game.loadState(gameState, [], []);
	        getEl('editor').style.display = 'none';
	        isEditorOpen = false;
	      } catch (err) {
	        //throw err;
	        alert(err);
	      }
	    }
	  };
	
	  getEl('editor-save').onclick = loadMap;
	
	  getEl('reset').onclick = function () {
	    log = 'Reset.\n';
	    updateLog();
	    try {
	      game.loadState(gameState, [], []);
	    } catch (err) {
	      alert(err);
	    }
	  };
	
	  getEl('instructions-run').onclick = function () {
	    var val = getEl('instructions-input').value;
	    if (val.length === 0) {
	      return;
	    }
	    game.performAction(val[0].toLowerCase());
	    getEl('instructions-input').value = val.substring(1);
	  };
	
	  gridWorld.run();
	};
	
	window.onload = function () {
	  if (OL) {
	    OL(init);
	  } else {
	    init();
	  }
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _GridWorld = __webpack_require__(2);
	
	var _GridWorld2 = _interopRequireDefault(_GridWorld);
	
	var _RuleSet = __webpack_require__(4);
	
	var _RuleSet2 = _interopRequireDefault(_RuleSet);
	
	var _Constants = __webpack_require__(5);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Tile = function () {
	  function Tile(symbol) {
	    var orientation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	
	    _classCallCheck(this, Tile);
	
	    var symbolMap = {
	      'T': [_Constants.TileTypes.Ground, _Constants.FeatureTypes.Tree],
	      't': [_Constants.TileTypes.Ground, _Constants.FeatureTypes.Stump], // extra, shimmed in
	      'a': [_Constants.TileTypes.Ground, _Constants.FeatureTypes.Axe],
	      'k': [_Constants.TileTypes.Ground, _Constants.FeatureTypes.Key],
	      // 'o': [TileTypes.Ground, FeatureTypes.Stone],
	      '$': [_Constants.TileTypes.Ground, _Constants.FeatureTypes.Gold],
	      'x': [_Constants.TileTypes.Ground, _Constants.FeatureTypes.Start], // extra, shimmed in
	      ' ': [_Constants.TileTypes.Ground, _Constants.FeatureTypes.Empty],
	      '-': [_Constants.TileTypes.Wall, _Constants.FeatureTypes.Door],
	      '!': [_Constants.TileTypes.Wall, _Constants.FeatureTypes.DoorOpen], // extra, shimmed in
	      '*': [_Constants.TileTypes.Wall, _Constants.FeatureTypes.Wall],
	      '~': [_Constants.TileTypes.Water, _Constants.FeatureTypes.Empty],
	      // 'O': [TileTypes.Water,  FeatureTypes.Stone],
	      'd': [_Constants.TileTypes.Ground, _Constants.FeatureTypes.Dynamite],
	      'w': [_Constants.TileTypes.Ground, _Constants.FeatureTypes.Wilson], // ???
	      'D': [_Constants.TileTypes.Ground, _Constants.FeatureTypes.Exploded] // extra, shimmed in
	    };
	
	    var _symbolMap$symbol = _slicedToArray(symbolMap[symbol], 2),
	        tile = _symbolMap$symbol[0],
	        feature = _symbolMap$symbol[1];
	
	    this.tile = tile;
	    this.feature = feature;
	    this.orientation = orientation;
	  }
	
	  _createClass(Tile, [{
	    key: 'getLinkingType',
	    value: function getLinkingType() {
	      if (this.orientation === null) return null;
	
	      var _orientation = this.orientation,
	          linkN = _orientation.linkN,
	          linkS = _orientation.linkS,
	          linkE = _orientation.linkE,
	          linkW = _orientation.linkW;
	      var n = linkN,
	          s = linkS,
	          e = linkE,
	          w = linkW;
	
	      // Name for every linking type, as a combination of N/S/E/W
	
	      var tileCondition = {
	        X: n && s && e && w,
	
	        WX: n && s && e && !w,
	        EX: n && s && !e && w,
	        SX: n && !s && e && w,
	        NX: !n && s && e && w,
	
	        NW: !n && s && e && !w,
	        NE: !n && s && !e && w,
	        SW: n && !s && e && !w,
	        SE: n && !s && !e && w,
	
	        NS: n && s && !e && !w,
	        EW: !n && !s && e && w,
	
	        S: n && !s && !e && !w,
	        N: !n && s && !e && !w,
	        W: !n && !s && e && !w,
	        E: !n && !s && !e && w,
	
	        A: !n && !s && !e && !w
	      };
	
	      return Object.keys(tileCondition).filter(function (key) {
	        return tileCondition[key];
	      })[0];
	    }
	  }, {
	    key: 'getBoundingType',
	    value: function getBoundingType() {
	      var isGround = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
	
	      if (this.orientation === null) return null;
	
	      var _orientation2 = this.orientation,
	          waterN = _orientation2.waterN,
	          waterS = _orientation2.waterS,
	          waterE = _orientation2.waterE,
	          waterW = _orientation2.waterW,
	          groundN = _orientation2.groundN,
	          groundS = _orientation2.groundS,
	          groundE = _orientation2.groundE,
	          groundW = _orientation2.groundW;
	
	      var _ref = isGround ? [groundN, groundS, groundE, groundW] : [waterN, waterS, waterE, waterW],
	          _ref2 = _slicedToArray(_ref, 4),
	          n = _ref2[0],
	          s = _ref2[1],
	          e = _ref2[2],
	          w = _ref2[3];
	
	      // Name for every bounding type, as a combination of N/S/E/W
	
	
	      var tileCondition = {
	        NW: !n && s && e && !w,
	        NE: !n && s && !e && w,
	        SW: n && !s && e && !w,
	        SE: n && !s && !e && w,
	
	        SU: n && !s && !e && !w,
	        NU: !n && s && !e && !w,
	        WU: !n && !s && e && !w,
	        EU: !n && !s && !e && w,
	
	        O: !n && !s && !e && !w
	      };
	
	      var result = Object.keys(tileCondition).filter(function (key) {
	        return tileCondition[key];
	      });
	
	      if (result.length === 1) {
	        return result[0];
	      } else {
	        return null;
	      }
	    }
	  }, {
	    key: 'getLayer',
	    value: function getLayer(layer) {
	      var prefix = null;
	      var key = null;
	
	      if (layer === 0) {
	        if (this.tile === _Constants.TileTypes.Water) {
	          key = Symbol.keyFor(_Constants.TileTypes.Water);
	        } else {
	          key = Symbol.keyFor(_Constants.TileTypes.Ground);
	        }
	
	        var bounding = this.getBoundingType(this.tile !== _Constants.TileTypes.Water);
	        if (bounding) {
	          key = bounding + '-' + key;
	        }
	      } else if (layer === 1 && this.tile !== _Constants.TileTypes.Wall) {
	        key = Symbol.keyFor(this.tile);
	
	        if (this.feature === _Constants.FeatureTypes.Empty) {
	          prefix = null;
	        } else {
	          prefix = Symbol.keyFor(this.feature);
	        }
	
	        if (key !== null && prefix !== null) {
	          key = prefix + '-' + key;
	        } else {
	          key = null;
	        }
	      } else if (layer === 2 && this.tile === _Constants.TileTypes.Wall) {
	        var linking = this.getLinkingType();
	        if (this.feature === _Constants.FeatureTypes.Door || this.feature === _Constants.FeatureTypes.DoorOpen) {
	          if (['S', 'N', 'SX', 'NX', 'NS'].includes(linking)) {
	            linking = 'NS';
	          } else {
	            linking = 'EW';
	          }
	        }
	        key = linking + '-' + Symbol.keyFor(this.feature);
	      }
	
	      return key;
	    }
	  }]);
	
	  return Tile;
	}();
	
	var RogueGame = function () {
	  function RogueGame(canvas, stateString, spriteSheet, onChange) {
	    _classCallCheck(this, RogueGame);
	
	    this.canvas = canvas;
	    this.onChange = onChange;
	    this.startingState = null;
	    this.loadState(stateString);
	    var layers = this.createLayers(this.grid);
	    var _ref3 = [this.grid.width, this.grid.height],
	        width = _ref3[0],
	        height = _ref3[1];
	
	
	    this.gridWorld = new _GridWorld2.default(this.canvas, {
	      "width": width,
	      "height": height,
	      "size": 64,
	      "pan": [width / 2, height / 2],
	      "grid": layers,
	      "spritesheet": spriteSheet,
	      "sprites": {
	        "Axe-Ground": { sheet: { x: 0, y: 0 } },
	        "Exploded-Ground": { sheet: { x: 1, y: 0 } },
	        "EW-Door": { sheet: { x: 2, y: 0 } },
	        "NS-Door": { sheet: { x: 3, y: 0 } },
	        "EW-DoorOpen": { sheet: { x: 4, y: 0 } },
	        "NS-DoorOpen": { sheet: { x: 5, y: 0 } },
	        "Dynamite-Ground": { sheet: { x: 6, y: 0 } },
	        "Gold-Ground": { sheet: { x: 7, y: 0 } },
	
	        "EU-Ground": { sheet: { x: 0, y: 1 } },
	        "NE-Ground": { sheet: { x: 1, y: 1 } },
	        "NU-Ground": { sheet: { x: 2, y: 1 } },
	        "NW-Ground": { sheet: { x: 3, y: 1 } },
	        "O-Ground": { sheet: { x: 4, y: 1 } },
	        "SE-Ground": { sheet: { x: 5, y: 1 } },
	        "SU-Ground": { sheet: { x: 6, y: 1 } },
	        "SW-Ground": { sheet: { x: 7, y: 1 } },
	
	        "WU-Ground": { sheet: { x: 0, y: 2 } },
	        "Ground": { sheet: { x: 1, y: 2 } },
	        "Key-Ground": { sheet: { x: 2, y: 2 } },
	
	        "a>": { sheet: { x: 3, y: 2 } },
	        "a^": { sheet: { x: 4, y: 2 } },
	        "av": { sheet: { x: 5, y: 2 } },
	        "a<": { sheet: { x: 6, y: 2 } },
	        ">": { sheet: { x: 7, y: 2 } },
	        "^": { sheet: { x: 0, y: 3 } },
	        "v": { sheet: { x: 1, y: 3 } },
	        "<": { sheet: { x: 2, y: 3 } },
	
	        "Raft": { sheet: { x: 3, y: 3 } },
	
	        "Start-Ground": { sheet: { x: 4, y: 3 } },
	        "Stump-Ground": { sheet: { x: 5, y: 3 } },
	        "Tree-Ground": { sheet: { x: 6, y: 3 } },
	
	        "A-Wall": { sheet: { x: 7, y: 3 } },
	
	        "E-Wall": { sheet: { x: 0, y: 4 } },
	        "EW-Wall": { sheet: { x: 1, y: 4 } },
	        "EX-Wall": { sheet: { x: 2, y: 4 } },
	
	        "N-Wall": { sheet: { x: 3, y: 4 } },
	        "NE-Wall": { sheet: { x: 4, y: 4 } },
	        "NS-Wall": { sheet: { x: 5, y: 4 } },
	        "NW-Wall": { sheet: { x: 6, y: 4 } },
	        "NX-Wall": { sheet: { x: 7, y: 4 } },
	
	        "S-Wall": { sheet: { x: 0, y: 5 } },
	        "SE-Wall": { sheet: { x: 1, y: 5 } },
	        "SW-Wall": { sheet: { x: 2, y: 5 } },
	        "SX-Wall": { sheet: { x: 3, y: 5 } },
	
	        "W-Wall": { sheet: { x: 4, y: 5 } },
	        "WX-Wall": { sheet: { x: 5, y: 5 } },
	        "X-Wall": { sheet: { x: 6, y: 5 } },
	
	        "EU-Water": { sheet: { x: 7, y: 5 } },
	        "NE-Water": { sheet: { x: 0, y: 6 } },
	        "NU-Water": { sheet: { x: 1, y: 6 } },
	        "NW-Water": { sheet: { x: 2, y: 6 } },
	        "O-Water": { sheet: { x: 3, y: 6 } },
	        "SE-Water": { sheet: { x: 4, y: 6 } },
	        "SU-Water": { sheet: { x: 5, y: 6 } },
	        "SW-Water": { sheet: { x: 6, y: 6 } },
	        "WU-Water": { sheet: { x: 7, y: 6 } },
	        "Water": { sheet: { x: 0, y: 7 } },
	        "Wilson-Ground": { sheet: { x: 1, y: 7 } },
	
	        "Unseen": { fill: 'rgba(0, 0, 0, 0.4)', stroke: 'rgba(96, 96, 96, 0.8)' },
	        "Unvisited": { fill: 'rgba(0, 0, 0, 0.8)', stroke: 'rgba(32, 32, 32, 0.8)' }
	      }
	    });
	  }
	
	  _createClass(RogueGame, [{
	    key: 'loadState',
	    value: function loadState(stateString) {
	      var visited = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	      var inventory = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
	
	      var _this = this;
	
	      var explosions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
	      var isStartingState = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;
	
	      this.explosions = [];
	
	      if (explosions) {
	        this.explosions = explosions;
	      }
	
	      if (isStartingState) {
	        this.startingState = null;
	      }
	
	      try {
	        this.grid = this.parse(stateString);
	      } catch (err) {
	        throw "Unable to parse the map.";
	      }
	
	      this.isGameOver = false;
	      this.isWin = false;
	      this.visited = Array(this.grid.width * this.grid.height).fill('Unvisited');
	
	      if (inventory) {
	        this.inventory = inventory;
	      }
	
	      if (!this.inventory) {
	        this.inventory = [];
	      }
	
	      if (visited) {
	        visited.forEach(function (value, index) {
	          return _this.visited[index] = null;
	        });
	      }
	
	      if (!this.ruleset) {
	        this.ruleset = new _RuleSet2.default(this.grid, this.inventory, this.explosions);
	      } else {
	        this.ruleset.setState(this.grid, this.inventory, this.explosions);
	      }
	
	      this.update('Map Loaded.');
	    }
	  }, {
	    key: 'getVisited',
	    value: function getVisited() {
	      var visited = [];
	      this.visited.forEach(function (value, index) {
	        if (value === null) visited.push(index);
	      });
	      return visited;
	    }
	  }, {
	    key: 'performAction',
	    value: function performAction(action) {
	      if (this.isGameOver || this.isWin) return;
	
	      var message = void 0;
	
	      try {
	        message = this.ruleset.perform(action);
	        if (message === true) {
	          this.isWin = true;
	        }
	      } catch (err) {
	        if (err.type === 'dead') {
	          if (err.reason === 'drowned') {
	            message = 'Agent fell into water and drowned';
	          } else if (err.reason === 'outside') {
	            message = 'Agent wandered off and got lost in the wilderness';
	          } else {
	            message = 'Agent died... somehow';
	          }
	
	          this.isGameOver = true;
	        } else {
	          throw err;
	        }
	      }
	
	      if (message === true) {
	        message = 'Gold has been collected.\nMission successful!\n';
	      }
	
	      this.update(action.toUpperCase() + ': ' + message);
	    }
	  }, {
	    key: 'update',
	    value: function update(message) {
	      this.updateVisited(this.grid);
	
	      if (this.gridWorld) {
	        var layers = this.createLayers(this.grid);
	        var _ref4 = [this.grid.width, this.grid.height],
	            width = _ref4[0],
	            height = _ref4[1];
	
	
	        this.gridWorld.changeLayers(layers, width, height);
	        this.gridWorld.hasModified = true;
	      }
	
	      if (this.onChange) {
	        this.onChange(this.grid, this.inventory, this.visited, this.isGameOver || this.isWin, message, this.getWindow());
	      }
	    }
	  }, {
	    key: 'updateVisited',
	    value: function updateVisited(grid) {
	      var py = Math.floor(grid.player.index / grid.width);
	      var px = grid.player.index % grid.width;
	      for (var y = py - 2; y <= py + 2; y++) {
	        for (var x = px - 2; x <= px + 2; x++) {
	          if (this.inBounds(x, y, grid)) {
	            this.visited[y * grid.width + x] = null;
	          }
	        }
	      }
	    }
	  }, {
	    key: 'fillExtraFeatures',
	    value: function fillExtraFeatures(cell, i) {
	      // infer hidden or unspecified features
	      var startCell = this.startingState[i];
	
	      if (_Constants.PlayerChars.includes(cell)) {
	        // infer what cell the player is standing on
	        if (startCell === '~') {
	          // in the water
	          cell = 'O'; // player must be standing on a stone
	        } else if (startCell === '-') {
	          // in a doorway
	          cell = '-'; // player must be standing in a doorway
	        } else {
	          cell = ' '; // player must be standing on the ground
	        }
	      }
	
	      if (cell === ' ') {
	        if (startCell === 'T') {
	          // This was a tree when we started
	          cell = 't'; // now a stump
	        } else if (startCell === '-') {
	          // This was a doorway
	          cell = '!'; // now an open door
	        } else if (_Constants.PlayerChars.includes(startCell)) {
	          // This is where the player started
	          cell = 'x'; // mark starting location
	        }
	      }
	
	      if (this.explosions.includes(cell)) {
	        cell = 'D';
	      }
	
	      return cell;
	    }
	  }, {
	    key: 'findPlayer',
	    value: function findPlayer(mapData) {
	      var player = {
	        index: null,
	        orientation: null
	      };
	
	      mapData.forEach(function (cell, i) {
	        var orientation = _Constants.PlayerChars.indexOf(cell);
	        if (orientation >= 0) {
	          player.index = i;
	          player.orientation = orientation;
	        }
	      });
	
	      return player;
	    }
	  }, {
	    key: 'calculateOrientation',
	    value: function calculateOrientation(cell, i, mapData, width, height) {
	      var wallFeatures = ['-', '!', '*'];
	      var orientation = {};
	
	      var featurePresent = function featurePresent(x, y, features, notFeatures) {
	        if (x >= 0 && x < width && y >= 0 && y < height) {
	          if (features) {
	            return features.includes(mapData[y * width + x]);
	          } else {
	            return !notFeatures.includes(mapData[y * width + x]);
	          }
	        } else {
	          if (!features || features.includes('~')) {
	            return true;
	          } else {
	            return false;
	          }
	        }
	      };
	
	      var y = Math.floor(i / width);
	      var x = i % width;
	
	      if (wallFeatures.includes(cell)) {
	        Object.assign(orientation, {
	          linkN: featurePresent(x, y - 1, wallFeatures),
	          linkS: featurePresent(x, y + 1, wallFeatures),
	          linkE: featurePresent(x + 1, y, wallFeatures),
	          linkW: featurePresent(x - 1, y, wallFeatures)
	        });
	      }
	
	      if (cell === '~') {
	        Object.assign(orientation, {
	          waterN: featurePresent(x, y - 1, ['~']),
	          waterS: featurePresent(x, y + 1, ['~']),
	          waterE: featurePresent(x + 1, y, ['~']),
	          waterW: featurePresent(x - 1, y, ['~'])
	        });
	      } else {
	        Object.assign(orientation, {
	          groundN: featurePresent(x, y - 1, null, ['~']),
	          groundS: featurePresent(x, y + 1, null, ['~']),
	          groundE: featurePresent(x + 1, y, null, ['~']),
	          groundW: featurePresent(x - 1, y, null, ['~'])
	        });
	      }
	
	      return orientation;
	    }
	  }, {
	    key: 'inBounds',
	    value: function inBounds(x, y, grid) {
	      var _ref5 = [grid.width, grid.height],
	          width = _ref5[0],
	          height = _ref5[1];
	
	      return x >= 0 && x < width && y >= 0 && y < height;
	    }
	  }, {
	    key: 'createLayers',
	    value: function createLayers(grid) {
	      var backgroundLayer = grid.tiles.map(function (tile) {
	        return tile.getLayer(0);
	      });
	      var foregroundLayer = grid.tiles.map(function (tile) {
	        return tile.getLayer(1);
	      });
	      var wallLayer = grid.tiles.map(function (tile) {
	        return tile.getLayer(2);
	      });
	      var extrasLayer = Array(grid.width * grid.height).fill(null);
	      var playerLayer = Array(grid.width * grid.height).fill(null);
	      var visibleLayer = Array(grid.width * grid.height).fill('Unseen');
	      var visitedLayer = this.visited;
	
	      if (!this.isGameOver) {
	
	        if (this.inventory.includes(_Constants.InventoryTypes.Axe)) {
	          playerLayer[grid.player.index] = 'a' + _Constants.PlayerChars[grid.player.orientation];
	        } else {
	          playerLayer[grid.player.index] = _Constants.PlayerChars[grid.player.orientation];
	        }
	        if (this.inventory.includes(_Constants.InventoryTypes.Raft) && grid.tiles[grid.player.index].tile === _Constants.TileTypes.Water) {
	          extrasLayer[grid.player.index] = 'Raft';
	        }
	      }
	
	      var py = Math.floor(grid.player.index / grid.width);
	      var px = grid.player.index % grid.width;
	      for (var y = py - 2; y <= py + 2; y++) {
	        for (var x = px - 2; x <= px + 2; x++) {
	          if (this.inBounds(x, y, grid)) {
	            visibleLayer[y * grid.width + x] = null;
	          }
	        }
	      }
	
	      return [backgroundLayer, foregroundLayer, wallLayer, extrasLayer, playerLayer, visibleLayer, visitedLayer, null];
	    }
	  }, {
	    key: 'revealMap',
	    value: function revealMap() {
	      this.visited = Array(this.grid.width * this.grid.height).fill(null);
	      this.update('Revealed Map');
	    }
	  }, {
	    key: 'getWindow',
	    value: function getWindow() {
	      var grid = this.grid;
	      var py = Math.floor(grid.player.index / grid.width);
	      var px = grid.player.index % grid.width;
	      var size = 5;
	      var windStr = '';
	
	      var tileToChar = function tileToChar(x, y) {
	        var tile = grid.tiles[y * grid.width + x];
	        if (tile.tile === _Constants.TileTypes.Ground) {
	          switch (tile.feature) {
	            case _Constants.FeatureTypes.Tree:
	              return 'T';
	            case _Constants.FeatureTypes.Axe:
	              return 'a';
	            case _Constants.FeatureTypes.Key:
	              return 'k';
	            case _Constants.FeatureTypes.Stone:
	              return 'o';
	            case _Constants.FeatureTypes.Gold:
	              return 'g';
	            case _Constants.FeatureTypes.Dynamite:
	              return 'd';
	            case _Constants.FeatureTypes.Wilson:
	              return '?';
	            default:
	              return ' ';
	          }
	        } else if (tile.tile === _Constants.TileTypes.Wall) {
	          switch (tile.feature) {
	            case _Constants.FeatureTypes.Door:
	              return '-';
	            default:
	              return '*';
	          }
	        } else if (tile.tile === _Constants.TileTypes.Water) {
	          switch (tile.feature) {
	            case _Constants.FeatureTypes.Stone:
	              return 'O';
	            default:
	              return '~';
	          }
	        }
	      };
	
	      for (var i = 0; i < size * size; ++i) {
	        if (i % size === 0 && i !== 0) {
	          windStr += '\n';
	        }
	
	        var wx = i % size - 2,
	            wy = Math.floor(i / size) - 2;
	
	        var x = void 0,
	            y = void 0;
	
	        switch (grid.player.orientation) {
	          case _Constants.PlayerDirections.North:
	            x = px + wx, y = py + wy;break;
	          case _Constants.PlayerDirections.South:
	            x = px - wx, y = py - wy;break;
	          case _Constants.PlayerDirections.West:
	            x = px + wy, y = py - wx;break;
	          case _Constants.PlayerDirections.East:
	            x = px - wy, y = py + wx;break;
	        }
	
	        if (this.inBounds(x, y, grid)) {
	          windStr += tileToChar(x, y);
	        } else {
	          windStr += '.';
	        }
	      }
	
	      return windStr;
	    }
	  }, {
	    key: 'parse',
	    value: function parse(stateString) {
	      var _this2 = this;
	
	      var rows = stateString.split('\n').filter(function (row) {
	        return row.length > 0;
	      });
	      var height = rows.length;
	      var width = rows[0].length;
	      var data = [];
	
	      rows.forEach(function (row) {
	        if (row.length === width) {
	          row.split('').forEach(function (cell) {
	            return data.push(cell);
	          });
	        } else {
	          throw "Incorrect width";
	        }
	      });
	
	      if (!this.startingState) {
	        this.startingState = data.slice();
	      }
	
	      var tiles = data.map(function (cell, i) {
	        cell = _this2.fillExtraFeatures(cell, i);
	        var orientation = _this2.calculateOrientation(cell, i, data, width, height);
	        return new Tile(cell, orientation);
	      });
	
	      var player = this.findPlayer(data);
	
	      return {
	        width: width,
	        height: height,
	        tiles: tiles,
	        player: player
	      };
	    }
	  }]);
	
	  return RogueGame;
	}();
	
	exports.default = RogueGame;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Game2 = __webpack_require__(3);
	
	var _Game3 = _interopRequireDefault(_Game2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var NORTH = 0;
	var SOUTH = 1;
	var EAST = 2;
	var WEST = 3;
	
	var GridWorld = function (_Game) {
	  _inherits(GridWorld, _Game);
	
	  /*
	    initData = {
	      "width": 2,
	      "height": 2,
	      "size": 64,
	      "pan": [1, 1],
	      "grid": [
	        "a", null,
	        null, "b"
	      ],
	      "sprites": {
	        "a": "https://www.example.com/a.png",
	        "b": [
	          "https://www.example.com/b1.png",
	          "https://www.example.com/b2.png",
	          "https://www.example.com/b3.png",
	          "https://www.example.com/b4.png"
	        ]
	      }
	    }
	  */
	  function GridWorld(canvas, initData) {
	    _classCallCheck(this, GridWorld);
	
	    var _this = _possibleConstructorReturn(this, (GridWorld.__proto__ || Object.getPrototypeOf(GridWorld)).call(this, canvas));
	
	    _this.gridWidth = initData.width;
	    _this.gridHeight = initData.height;
	    _this.gridSize = initData.size;
	    _this.background = initData.background || [];
	    _this.grid = initData.grid || [[]];
	    var _iteratorNormalCompletion = true;
	    var _didIteratorError = false;
	    var _iteratorError = undefined;
	
	    try {
	      for (var _iterator = _this.grid[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	        var layer = _step.value;
	
	        if (layer) {
	          layer.length = _this.gridWidth * _this.gridHeight;
	        }
	      }
	    } catch (err) {
	      _didIteratorError = true;
	      _iteratorError = err;
	    } finally {
	      try {
	        if (!_iteratorNormalCompletion && _iterator.return) {
	          _iterator.return();
	        }
	      } finally {
	        if (_didIteratorError) {
	          throw _iteratorError;
	        }
	      }
	    }
	
	    _this.gridPan = initData.pan || [Math.floor(gridWidth / 2), Math.floor(gridHeight / 2)];
	    _this.loadSprites(initData.sprites, initData.spritesheet);
	    _this.hasModified = true;
	    return _this;
	  }
	
	  _createClass(GridWorld, [{
	    key: 'changeLayers',
	    value: function changeLayers() {
	      var layers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.grid;
	      var width = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.gridWidth;
	      var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.gridHeight;
	      var size = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this.gridSize;
	
	      this.grid = layers;
	      this.gridWidth = width;
	      this.gridHeight = height;
	      this.gridSize = size;
	    }
	  }, {
	    key: 'changeSprites',
	    value: function changeSprites(spriteSheetUrl) {
	      var _this2 = this;
	
	      if (spriteSheetUrl) {
	        if (this.spritesheet && spriteSheetUrl === this.spritesheet.src) {
	          return;
	        }
	        this.spritesheet = new Image();
	        this.spritesheet.src = spriteSheetUrl;
	        this.spritesheet.onload = function () {
	          return _this2.hasModified = true;
	        };
	      }
	    }
	  }, {
	    key: 'loadSprites',
	    value: function loadSprites(sprites, spritesheet) {
	      var _this3 = this;
	
	      this.sprites = sprites || {};
	      Object.keys(this.sprites).forEach(function (key) {
	        if (typeof _this3.sprites[key] === 'string') {
	          var image = new Image();
	          image.src = _this3.sprites[key];
	          image.onload = function () {
	            return _this3.hasModified = true;
	          };
	          _this3.sprites[key] = image;
	        }
	      });
	
	      this.changeSprites(spritesheet);
	    }
	  }, {
	    key: 'update',
	    value: function update(dt) {
	      return this.hasModified;
	    }
	  }, {
	    key: 'lookup',
	    value: function lookup(x, y) {
	      return this.grid[y * this.gridWidth + x];
	    }
	  }, {
	    key: 'startDrag',
	    value: function startDrag(x, y) {
	      this.drag = {
	        x: x,
	        y: y,
	        pan: {
	          x: this.gridPan[0],
	          y: this.gridPan[1]
	        }
	      };
	    }
	  }, {
	    key: 'moveDrag',
	    value: function moveDrag(x, y) {
	      if (!this.drag) return;
	
	      var gridDx = -(x - this.drag.x) / this.gridSize;
	      var gridDy = -(y - this.drag.y) / this.gridSize;
	
	      this.gridPan[0] = this.drag.pan.x + gridDx;
	      this.gridPan[1] = this.drag.pan.y + gridDy;
	      this.hasModified = true;
	    }
	  }, {
	    key: 'endDrag',
	    value: function endDrag(x, y) {
	      this.drag = null;
	    }
	  }, {
	    key: 'getPan',
	    value: function getPan() {
	      return {
	        x: this.gridPan[0] * this.gridSize,
	        y: this.gridPan[1] * this.gridSize
	      };
	    }
	  }, {
	    key: 'pan',
	    value: function pan(dx, dy) {
	      this.gridPan[0] -= dx / this.gridSize;
	      this.gridPan[1] -= dy / this.gridSize;
	      this.hasModified = true;
	    }
	  }, {
	    key: 'panTo',
	    value: function panTo(x, y) {
	      this.gridPan[0] = x / this.gridSize;
	      this.gridPan[1] = y / this.gridSize;
	    }
	  }, {
	    key: 'drawLayer',
	    value: function drawLayer(layer) {
	      var ctx = this.context;
	      var scale = this.gridSize;
	      var offsetX = this.width / 2 - this.gridPan[0] * scale;
	      var offsetY = this.height / 2 - this.gridPan[1] * scale;
	
	      var x = void 0,
	          y = void 0;
	      var textWidth = void 0,
	          sprite = void 0;
	
	      ctx.font = scale / 2 + 'px sans-serif';
	      ctx.imageSmoothingEnabled = false;
	
	      var gridI = 0;
	      while (gridI < this.gridWidth * this.gridHeight) {
	        y = offsetY + scale * Math.floor(gridI / this.gridWidth);
	        x = offsetX + scale * (gridI % this.gridWidth);
	
	        if (x < -scale || x > this.width + scale || y < -scale || y > this.height + scale) {
	          gridI++;
	          continue;
	        }
	
	        if (!layer) {
	          ctx.strokeStyle = '#666';
	          ctx.strokeRect(x, y, scale, scale);
	        } else if (layer[gridI]) {
	          sprite = this.sprites[layer[gridI]];
	
	          if (sprite && sprite.complete && sprite instanceof Image) {
	            ctx.drawImage(sprite, 0, 0, scale, scale, x, y, scale, scale);
	          } else if (sprite) {
	            if (sprite.fill) {
	              ctx.fillStyle = sprite.fill;
	              ctx.fillRect(x, y, scale, scale);
	            }
	            if (sprite.stroke) {
	              ctx.strokeStyle = sprite.stroke;
	              ctx.strokeRect(x, y, scale, scale);
	            }
	            if (sprite.sheet) {
	              ctx.drawImage(this.spritesheet, sprite.sheet.x * scale, sprite.sheet.y * scale, scale, scale, x, y, scale, scale);
	            }
	          } else {
	            textWidth = ctx.measureText(layer[gridI]).width;
	            ctx.fillText(layer[gridI], x + scale / 2 - textWidth / 2, y + 5 * scale / 8);
	          }
	        }
	
	        gridI++;
	      }
	    }
	  }, {
	    key: 'draw',
	    value: function draw() {
	      var ctx = this.context;
	
	      ctx.clearRect(0, 0, this.width, this.height);
	      ctx.fillStyle = 'black';
	      ctx.fillRect(0, 0, this.width, this.height);
	
	      var layer = void 0;
	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;
	
	      try {
	        for (var _iterator2 = this.grid[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          layer = _step2.value;
	
	          this.drawLayer(layer);
	        }
	      } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion2 && _iterator2.return) {
	            _iterator2.return();
	          }
	        } finally {
	          if (_didIteratorError2) {
	            throw _iteratorError2;
	          }
	        }
	      }
	
	      this.hasModified = false;
	    }
	  }]);
	
	  return GridWorld;
	}(_Game3.default);
	
	exports.default = GridWorld;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
	  return window.setTimeout(callback, 1000 / 60);
	};
	
	var cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || window.clearTimeout;
	
	var Game = function () {
	  function Game(canvas) {
	    var _this = this;
	
	    _classCallCheck(this, Game);
	
	    if (new.target === Game) {
	      throw new TypeError("Cannot construct an abstract class");
	    }
	
	    if (typeof canvas === 'string') {
	      this.canvas = document.getElementById(canvas);
	      if (!this.canvas) throw new Error("Unable to find element with ID: " + canvas);
	    } else {
	      this.canvas = canvas;
	    }
	
	    this.canvas.style.position = "absolute";
	    this.canvas.style.top = "0";
	    this.canvas.style.left = "0";
	    this.context = this.canvas.getContext('2d');
	
	    window.onresize = function (e) {
	      _this.canvas.width = window.innerWidth;
	      _this.canvas.height = Math.max(window.innerHeight, 720);
	      _this.width = _this.canvas.width;
	      _this.height = _this.canvas.height;
	    };
	    window.onresize();
	
	    this.running = false;
	    this.frameRequest = null;
	  }
	
	  _createClass(Game, [{
	    key: "update",
	    value: function update(dt) {
	      throw new TypeError("Not Implemented: update method is required");
	    }
	  }, {
	    key: "draw",
	    value: function draw() {
	      throw new TypeError("Not Implemented: draw method is required");
	    }
	  }, {
	    key: "run",
	    value: function run() {
	      var _this2 = this;
	
	      if (this.running) return;
	
	      this.running = true;
	      var processFrame = function processFrame() {
	        _this2.step();
	        _this2.frameRequest = requestAnimationFrame(processFrame);
	      };
	
	      this.lastStep = Date.now();
	      this.frameRequest = requestAnimationFrame(processFrame);
	    }
	  }, {
	    key: "stop",
	    value: function stop() {
	      if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
	      this.frameRequest = null;
	      this.running = false;
	    }
	  }, {
	    key: "step",
	    value: function step() {
	      var now = Date.now();
	      var dt = (now - this.lastStep) / 1000;
	      this.lastStep = now;
	      if (this.update(dt) !== false) {
	        this.draw();
	      }
	    }
	  }]);
	
	  return Game;
	}();
	
	exports.default = Game;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _Constants = __webpack_require__(5);
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var PassableTerrain = [_Constants.FeatureTypes.Empty, _Constants.FeatureTypes.Stump, _Constants.FeatureTypes.Start, _Constants.FeatureTypes.Axe, _Constants.FeatureTypes.Key, _Constants.FeatureTypes.Dynamite, _Constants.FeatureTypes.Gold, _Constants.FeatureTypes.Exploded];
	
	var RuleSet = function () {
	  function RuleSet(grid, inventory, explosions) {
	    _classCallCheck(this, RuleSet);
	
	    this.setState(grid, inventory, explosions);
	  }
	
	  _createClass(RuleSet, [{
	    key: 'setState',
	    value: function setState(grid, inventory, explosions) {
	      this.grid = grid;
	      this.inventory = inventory;
	      this.explosions = explosions;
	    }
	  }, {
	    key: 'iToCoord',
	    value: function iToCoord(i) {
	      var x = i % this.grid.width;
	      var y = Math.floor(i / this.grid.width);
	
	      return [x, y];
	    }
	  }, {
	    key: 'coordToI',
	    value: function coordToI(coord) {
	      var _coord = _slicedToArray(coord, 2),
	          x = _coord[0],
	          y = _coord[1];
	
	      if (!this.inBounds(x, y)) {
	        return -1;
	      } else {
	        return y * this.grid.width + x;
	      }
	    }
	  }, {
	    key: 'inBounds',
	    value: function inBounds(x, y) {
	      var _ref = [this.grid.width, this.grid.height],
	          width = _ref[0],
	          height = _ref[1];
	
	      return x >= 0 && x < width && y >= 0 && y < height;
	    }
	  }, {
	    key: 'north',
	    value: function north(i) {
	      var _iToCoord = this.iToCoord(i),
	          _iToCoord2 = _slicedToArray(_iToCoord, 2),
	          x = _iToCoord2[0],
	          y = _iToCoord2[1];
	
	      return this.coordToI([x, y - 1]);
	    }
	  }, {
	    key: 'south',
	    value: function south(i) {
	      var _iToCoord3 = this.iToCoord(i),
	          _iToCoord4 = _slicedToArray(_iToCoord3, 2),
	          x = _iToCoord4[0],
	          y = _iToCoord4[1];
	
	      return this.coordToI([x, y + 1]);
	    }
	  }, {
	    key: 'west',
	    value: function west(i) {
	      var _iToCoord5 = this.iToCoord(i),
	          _iToCoord6 = _slicedToArray(_iToCoord5, 2),
	          x = _iToCoord6[0],
	          y = _iToCoord6[1];
	
	      return this.coordToI([x - 1, y]);
	    }
	  }, {
	    key: 'east',
	    value: function east(i) {
	      var _iToCoord7 = this.iToCoord(i),
	          _iToCoord8 = _slicedToArray(_iToCoord7, 2),
	          x = _iToCoord8[0],
	          y = _iToCoord8[1];
	
	      return this.coordToI([x + 1, y]);
	    }
	  }, {
	    key: 'perform',
	    value: function perform(action) {
	      var _this = this;
	
	      var message = null;
	
	      action = action.toLowerCase();
	
	      var dir = this.grid.player.orientation;
	      var index = this.grid.player.index;
	      var facing = ['north', 'east', 'south', 'west'][dir];
	      var inFront = this[facing](index);
	
	      var actions = {
	        r: function r() {
	          _this.grid.player.orientation = (dir + 1) % 4;
	          message = 'Turned right.';
	        },
	
	        l: function l() {
	          _this.grid.player.orientation = dir === 0 ? 3 : dir - 1;
	          message = 'Turned left.';
	        },
	
	        f: function f() {
	          if (inFront < 0) {
	            throw {
	              type: 'dead',
	              reason: 'outside'
	            };
	          }
	
	          var oldLocation = _this.grid.tiles[index];
	          var location = _this.grid.tiles[inFront];
	          var tile = location.tile;
	          var feature = location.feature;
	
	          var canMove = false;
	
	          if (tile === _Constants.TileTypes.Ground) {
	            // moving on ground
	            if (PassableTerrain.includes(feature)) {
	              canMove = true;
	            } else {
	              message = 'Blocked by: ' + Symbol.keyFor(feature);
	            }
	            if (feature === _Constants.FeatureTypes.Start && _this.inventory.includes(_Constants.InventoryTypes.Gold)) {
	              message = true;
	              var inventoryAt = _this.inventory.indexOf(_Constants.InventoryTypes.Gold);
	              _this.inventory.splice(inventoryAt, 1);
	            }
	            if (oldLocation.tile === _Constants.TileTypes.Water && canMove) {
	              // moving from water to ground
	              message = 'Raft broke.';
	              var _inventoryAt = _this.inventory.indexOf(_Constants.InventoryTypes.Raft);
	              _this.inventory.splice(_inventoryAt, 1);
	            }
	          } else if (tile === _Constants.TileTypes.Wall) {
	            if (feature === _Constants.FeatureTypes.DoorOpen) {
	              canMove = true;
	            } else if (feature === _Constants.FeatureTypes.Wall) {
	              message = 'Walked into a wall.';
	            } else if (feature === _Constants.FeatureTypes.Door) {
	              message = 'Door is locked.';
	            }
	            if (oldLocation.tile === _Constants.TileTypes.Water && canMove) {
	              // moving from water to doorway
	              message = 'Raft broke.';
	              var _inventoryAt2 = _this.inventory.indexOf(_Constants.InventoryTypes.Raft);
	              _this.inventory.splice(_inventoryAt2, 1);
	            }
	          } else if (tile === _Constants.TileTypes.Water) {
	            if (_this.inventory.includes(_Constants.InventoryTypes.Raft)) {
	              // if you have a raft you can move on water
	              canMove = true;
	            } else {
	              throw {
	                type: 'dead',
	                reason: 'drowned'
	              };
	            }
	          }
	
	          if (canMove) {
	            _this.grid.player.index = inFront;
	
	            var pickups = [_Constants.FeatureTypes.Key, _Constants.FeatureTypes.Axe, _Constants.FeatureTypes.Dynamite, _Constants.FeatureTypes.Gold];
	
	            if (tile === _Constants.TileTypes.Ground && pickups.includes(location.feature)) {
	              _this.inventory.push(location.feature);
	              message = 'Picked up: ' + Symbol.keyFor(location.feature);
	              location.feature = _Constants.FeatureTypes.Empty;
	            }
	
	            if (!message) {
	              message = 'Moved forward.';
	            }
	          }
	        },
	
	        c: function c() {
	          var location = _this.grid.tiles[inFront];
	          var feature = location.feature;
	
	          if (_this.inventory.includes(_Constants.InventoryTypes.Axe) && inFront >= 0 && feature === _Constants.FeatureTypes.Tree) {
	            // chop down the tree
	            location.feature = _Constants.FeatureTypes.Stump;
	            if (_this.inventory.includes(_Constants.InventoryTypes.Raft)) {
	              message = 'Chopped down a tree. Already have a raft.';
	            } else {
	              _this.inventory.push(_Constants.InventoryTypes.Raft);
	              message = 'Chopped down a tree and made a raft.';
	            }
	          } else {
	            message = 'Unable to chop.';
	          }
	        },
	
	        u: function u() {
	          var location = _this.grid.tiles[inFront];
	          var feature = location.feature;
	
	          if (_this.inventory.includes(_Constants.InventoryTypes.Key) && inFront >= 0 && feature === _Constants.FeatureTypes.Door) {
	            // unlock the door
	            location.feature = _Constants.FeatureTypes.DoorOpen;
	            message = 'Unlocked a door.';
	          } else {
	            message = 'Unable to unlock.';
	          }
	        },
	
	        b: function b() {
	          var location = _this.grid.tiles[inFront];
	
	          if (_this.inventory.includes(_Constants.InventoryTypes.Dynamite) && inFront >= 0 && (location.tile === _Constants.TileTypes.Wall || location.feature === _Constants.FeatureTypes.Tree)) {
	            (function () {
	              if (location.tile === _Constants.TileTypes.Wall) {
	                message = 'Blasted wall.';
	              } else {
	                message = 'Blasted tree.';
	              }
	              location.tile = _Constants.TileTypes.Ground;
	              location.feature = _Constants.FeatureTypes.Exploded;
	              _this.explosions.push(inFront);
	
	              // hack to make walls click together properly
	              var tileDirs = {
	                n: [_this.north(inFront), 'linkS'],
	                s: [_this.south(inFront), 'linkN'],
	                e: [_this.east(inFront), 'linkW'],
	                w: [_this.west(inFront), 'linkE']
	              };
	              Object.keys(tileDirs).forEach(function (key) {
	                var _tileDirs$key = _slicedToArray(tileDirs[key], 2),
	                    index = _tileDirs$key[0],
	                    link = _tileDirs$key[1];
	
	                var cell = _this.grid.tiles[index];
	                if (index >= 0 && cell.tile === _Constants.TileTypes.Wall) {
	                  cell.orientation[link] = false;
	                }
	              });
	
	              var inventoryAt = _this.inventory.indexOf(_Constants.InventoryTypes.Dynamite);
	              _this.inventory.splice(inventoryAt, 1);
	            })();
	          } else {
	            if (!_this.inventory.includes(_Constants.InventoryTypes.Dynamite)) {
	              message = 'No dynamite.';
	            } else {
	              message = 'Nothing to blow up.';
	            }
	          }
	        }
	      };
	
	      var delegate = actions[action];
	
	      if (delegate) {
	        delegate();
	      } else {
	        message = 'Unknown instruction.';
	      }
	
	      return message;
	    }
	  }]);
	
	  return RuleSet;
	}();
	
	exports.default = RuleSet;

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// Base background tile types
	var TileTypes = exports.TileTypes = {
	  Water: Symbol.for('Water'),
	  Ground: Symbol.for('Ground'),
	  Wall: Symbol.for('Wall')
	};
	
	// Features which may be on tiles
	var FeatureTypes = exports.FeatureTypes = {
	  Empty: Symbol.for('Empty'),
	  Tree: Symbol.for('Tree'),
	  Stump: Symbol.for('Stump'), // extra, shimmed in (for aesthetics)
	  Start: Symbol.for('Start'), // extra, shimmed in (for aesthetics)
	  Wall: Symbol.for('Wall'),
	  Door: Symbol.for('Door'),
	  DoorOpen: Symbol.for('DoorOpen'), // extra, shimmed in (for aesthetics)
	  Stone: Symbol.for('Stone'),
	  Axe: Symbol.for('Axe'),
	  Key: Symbol.for('Key'),
	  Gold: Symbol.for('Gold'),
	  Dynamite: Symbol.for('Dynamite'),
	  Exploded: Symbol.for('Exploded'),
	  Wilson: Symbol.for('Wilson')
	};
	
	var PlayerChars = exports.PlayerChars = ['^', '>', 'v', '<'];
	
	var PlayerDirections = exports.PlayerDirections = {
	  North: 0,
	  East: 1,
	  South: 2,
	  West: 3
	};
	
	var InventoryTypes = exports.InventoryTypes = {
	  Stone: Symbol.for('Stone'),
	  Axe: Symbol.for('Axe'),
	  Key: Symbol.for('Key'),
	  Gold: Symbol.for('Gold'),
	  Raft: Symbol.for('Raft'),
	  Dynamite: Symbol.for('Dynamite')
	};

/***/ }
/******/ ]);
//# sourceMappingURL=app.js.map