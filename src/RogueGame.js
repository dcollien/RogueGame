import GridWorld from './GridWorld.js';
import RuleSet from './RuleSet.js';
import {TileTypes, FeatureTypes, InventoryTypes, PlayerChars, PlayerDirections} from './Constants.js';

class Tile {
  constructor(symbol, orientation = null) {
    const symbolMap = {
      'T': [TileTypes.Ground, FeatureTypes.Tree],
      't': [TileTypes.Ground, FeatureTypes.Stump], // extra, shimmed in
      'a': [TileTypes.Ground, FeatureTypes.Axe],
      'k': [TileTypes.Ground, FeatureTypes.Key],
      'o': [TileTypes.Ground, FeatureTypes.Stone],
      '$': [TileTypes.Ground, FeatureTypes.Gold],
      'x': [TileTypes.Ground, FeatureTypes.Start], // extra, shimmed in
      ' ': [TileTypes.Ground, FeatureTypes.Empty],
      '-': [TileTypes.Wall,   FeatureTypes.Door],
      '!': [TileTypes.Wall,   FeatureTypes.DoorOpen], // extra, shimmed in
      '*': [TileTypes.Wall,   FeatureTypes.Wall],
      '~': [TileTypes.Water,  FeatureTypes.Empty],
      'O': [TileTypes.Water,  FeatureTypes.Stone],
      'd': [TileTypes.Ground, FeatureTypes.Dynamite],
      'w': [TileTypes.Ground, FeatureTypes.Wilson], // ???
      'D': [TileTypes.Ground, FeatureTypes.Exploded] // extra, shimmed in
    };

    const [tile, feature] = symbolMap[symbol];

    this.tile = tile;
    this.feature = feature;
    this.orientation = orientation;
  }

  getLinkingType() {
    if (this.orientation === null) return null;

    const {linkN, linkS, linkE, linkW} = this.orientation;
    const [n, s, e, w] = [linkN, linkS, linkE, linkW];

    // Name for every linking type, as a combination of N/S/E/W
    const tileCondition = {
      X:  n &&  s &&  e &&  w,

      WX: n &&  s &&  e && !w,
      EX: n &&  s && !e &&  w,
      SX: n && !s &&  e &&  w,
      NX:!n &&  s &&  e &&  w,

      NW:!n &&  s &&  e && !w,
      NE:!n &&  s && !e &&  w,
      SW: n && !s &&  e && !w,
      SE: n && !s && !e &&  w,

      NS: n &&  s && !e && !w,
      EW:!n && !s &&  e &&  w,

      S:  n && !s && !e && !w,
      N: !n &&  s && !e && !w,
      W: !n && !s &&  e && !w,
      E: !n && !s && !e &&  w,

      A: !n && !s && !e && !w
    };

    return Object.keys(tileCondition).filter((key) => tileCondition[key])[0];
  }

  getBoundingType(isGround=false) {
    if (this.orientation === null) return null;

    const {
      waterN, waterS, waterE, waterW,
      groundN, groundS, groundE, groundW
    } = this.orientation;

    const [n, s, e, w] = isGround ?
      [groundN, groundS, groundE, groundW] :
      [waterN, waterS, waterE, waterW];

    // Name for every bounding type, as a combination of N/S/E/W
    const tileCondition = {
      NW:!n &&  s &&  e && !w,
      NE:!n &&  s && !e &&  w,
      SW: n && !s &&  e && !w,
      SE: n && !s && !e &&  w,

      SU:  n && !s && !e && !w,
      NU: !n &&  s && !e && !w,
      WU: !n && !s &&  e && !w,
      EU: !n && !s && !e &&  w,

      O: !n && !s && !e && !w
    };

    const result = Object.keys(tileCondition).filter((key) => tileCondition[key]);

    if (result.length === 1) {
      return result[0];
    } else {
      return null;
    }
  }

  getLayer(layer) {
    let prefix = null;
    let key = null;

    if (layer === 0) {
      if (this.tile === TileTypes.Water) {
        key = Symbol.keyFor(TileTypes.Water);
      } else {
        key = Symbol.keyFor(TileTypes.Ground);
      }

      const bounding = this.getBoundingType(this.tile !== TileTypes.Water);
      if (bounding) {
        key = bounding + '-' + key;
      }
    } else if (layer === 1 && this.tile !== TileTypes.Wall) {
      key = Symbol.keyFor(this.tile);

      if (this.feature === FeatureTypes.Empty) {
        prefix = null;
      } else {
        prefix = Symbol.keyFor(this.feature);
      }

      if (key !== null && prefix !== null) {
        key = prefix + '-' + key;
      } else {
        key = null;
      }
    } else if (layer === 2 && this.tile === TileTypes.Wall) {
      let linking = this.getLinkingType();
      if (this.feature === FeatureTypes.Door || this.feature === FeatureTypes.DoorOpen) {
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
}

export default class RogueGame {
  constructor(canvas, stateString, spriteSheet, onChange) {
    this.canvas = canvas;
    this.onChange = onChange;
    this.startingState = null;
    this.loadState(stateString);
    const layers = this.createLayers(this.grid);
    const [width, height] = [this.grid.width, this.grid.height];

    this.gridWorld = new GridWorld(this.canvas, {
      "width": width,
      "height": height,
      "size": 64,
      "pan": [width / 2, height / 2],
      "grid": layers,
      "spritesheet": spriteSheet,
      "sprites": {
        "Axe-Ground":      {sheet: {x: 0, y: 0}},
        "Exploded-Ground": {sheet: {x: 1, y: 0}},
        "EW-Door":         {sheet: {x: 2, y: 0}},
        "NS-Door":         {sheet: {x: 3, y: 0}},
        "EW-DoorOpen":     {sheet: {x: 4, y: 0}},
        "NS-DoorOpen":     {sheet: {x: 5, y: 0}},
        "Dynamite-Ground": {sheet: {x: 6, y: 0}},
        "Gold-Ground":     {sheet: {x: 7, y: 0}},

        "EU-Ground": {sheet: {x: 0, y: 1}},
        "NE-Ground": {sheet: {x: 1, y: 1}},
        "NU-Ground": {sheet: {x: 2, y: 1}},
        "NW-Ground": {sheet: {x: 3, y: 1}},
        "Stone-Ground": {sheet: {x: 2, y: 7}},
        "SE-Ground": {sheet: {x: 5, y: 1}},
        "SU-Ground": {sheet: {x: 6, y: 1}},
        "SW-Ground": {sheet: {x: 7, y: 1}},

        "WU-Ground":  {sheet: {x: 0, y: 2}},
        "Ground":     {sheet: {x: 1, y: 2}},
        "Key-Ground": {sheet: {x: 2, y: 2}},

        "a>": {sheet: {x: 3, y: 2}},
        "a^": {sheet: {x: 4, y: 2}},
        "av": {sheet: {x: 5, y: 2}},
        "a<": {sheet: {x: 6, y: 2}},
        ">":  {sheet: {x: 7, y: 2}},
        "^":  {sheet: {x: 0, y: 3}},
        "v":  {sheet: {x: 1, y: 3}},
        "<":  {sheet: {x: 2, y: 3}},

        "Raft": {sheet: {x: 3, y: 3}},

        "Start-Ground": {sheet: {x: 4, y: 3}},
        "Stump-Ground": {sheet: {x: 5, y: 3}},
        "Tree-Ground":  {sheet: {x: 6, y: 3}},

        "A-Wall": {sheet: {x: 7, y: 3}},

        "E-Wall":  {sheet: {x: 0, y: 4}},
        "EW-Wall": {sheet: {x: 1, y: 4}},
        "EX-Wall": {sheet: {x: 2, y: 4}},

        "N-Wall":  {sheet: {x: 3, y: 4}},
        "NE-Wall": {sheet: {x: 4, y: 4}},
        "NS-Wall": {sheet: {x: 5, y: 4}},
        "NW-Wall": {sheet: {x: 6, y: 4}},
        "NX-Wall": {sheet: {x: 7, y: 4}},

        "S-Wall":  {sheet: {x: 0, y: 5}},
        "SE-Wall": {sheet: {x: 1, y: 5}},
        "SW-Wall": {sheet: {x: 2, y: 5}},
        "SX-Wall": {sheet: {x: 3, y: 5}},

        "W-Wall":  {sheet: {x: 4, y: 5}},
        "WX-Wall": {sheet: {x: 5, y: 5}},
        "X-Wall":  {sheet: {x: 6, y: 5}},

        "EU-Water": {sheet: {x: 7, y: 5}},
        "NE-Water": {sheet: {x: 0, y: 6}},
        "NU-Water": {sheet: {x: 1, y: 6}},
        "NW-Water": {sheet: {x: 2, y: 6}},
        "Stone-Water":  {sheet: {x: 3, y: 7}},
        "SE-Water": {sheet: {x: 4, y: 6}},
        "SU-Water": {sheet: {x: 5, y: 6}},
        "SW-Water": {sheet: {x: 6, y: 6}},
        "WU-Water": {sheet: {x: 7, y: 6}},
        "Water": {sheet: {x: 0, y: 7}},
        "Wilson-Ground": {sheet: {x: 1, y: 7}},

        "Unseen": {fill: 'rgba(0, 0, 0, 0.4)', stroke: 'rgba(96, 96, 96, 0.8)'},
        "Unvisited": {fill: 'rgba(0, 0, 0, 0.8)', stroke: 'rgba(32, 32, 32, 0.8)'}
      }
    });
  }

  loadState(stateString, visited=null, inventory=null, explosions=null, isStartingState=true) {
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
      visited.forEach((value, index) => this.visited[index] = null);
    }

    if (!this.ruleset) {
      this.ruleset = new RuleSet(this.grid, this.inventory, this.explosions);
    } else {
      this.ruleset.setState(this.grid, this.inventory, this.explosions);
    }

    this.update('Map Loaded.');
  }

  getVisited() {
    const visited = [];
    this.visited.forEach((value, index) => {
      if (value === null) visited.push(index);
    });
    return visited;
  }

  performAction(action) {
    if (this.isGameOver || this.isWin) return;

    let message;

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

  update(message) {
    this.updateVisited(this.grid);

    if (this.gridWorld) {
      const layers = this.createLayers(this.grid);
      const [width, height] = [this.grid.width, this.grid.height];

      this.gridWorld.changeLayers(layers, width, height);
      this.gridWorld.hasModified = true;
    }

    if (this.onChange) {
      this.onChange(this.grid, this.inventory, this.visited, this.isGameOver || this.isWin, message, this.getWindow());
    }
  }

  updateVisited(grid) {
    const py = Math.floor(grid.player.index / grid.width);
    const px = (grid.player.index % grid.width);
    for (let y = py - 2; y <= py + 2; y++) {
      for (let x = px - 2; x <= px + 2; x++) {
        if (this.inBounds(x, y, grid)) {
          this.visited[y * grid.width + x] = null;
        }
      }
    }
  }

  fillExtraFeatures(cell, i) {
    // infer hidden or unspecified features
    const startCell = this.startingState[i];

    if (PlayerChars.includes(cell)) {
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
      } else if (PlayerChars.includes(startCell)) {
        // This is where the player started
        cell = 'x'; // mark starting location
      }
    }

    if (this.explosions.includes(cell)) {
      cell = 'D';
    }

    return cell;
  }

  findPlayer(mapData) {
    const player = {
      index: null,
      orientation: null
    };

    mapData.forEach((cell, i) => {
      const orientation = PlayerChars.indexOf(cell);
      if (orientation >= 0) {
        player.index = i;
        player.orientation = orientation;
      }
    });

    return player;
  }

  calculateOrientation(cell, i, mapData, width, height) {
    const wallFeatures = ['-', '!', '*'];
    let orientation = {};

    const featurePresent = (x, y, features, notFeatures) => {
      if ((x >= 0 && x < width) && (y >= 0 && y < height)) {
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
    }

    const y = Math.floor(i / width);
    const x = (i % width);

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

  inBounds(x, y, grid) {
    const [width, height] = [grid.width, grid.height];
    return (x >= 0 && x < width) && (y >= 0 && y < height);
  }

  createLayers(grid) {
    const backgroundLayer = grid.tiles.map(tile => tile.getLayer(0));
    const foregroundLayer = grid.tiles.map(tile => tile.getLayer(1));
    const wallLayer       = grid.tiles.map(tile => tile.getLayer(2));
    const extrasLayer     = Array(grid.width * grid.height).fill(null);
    const playerLayer     = Array(grid.width * grid.height).fill(null);
    const visibleLayer    = Array(grid.width * grid.height).fill('Unseen');
    const visitedLayer    = this.visited;

    if (!this.isGameOver) {

      if (this.inventory.includes(InventoryTypes.Axe)) {
        playerLayer[grid.player.index] = 'a' + PlayerChars[grid.player.orientation];
      } else {
        playerLayer[grid.player.index] = PlayerChars[grid.player.orientation];
      }
      if (
        this.inventory.includes(InventoryTypes.Raft) &&
        grid.tiles[grid.player.index].tile === TileTypes.Water &&
        grid.tiles[grid.player.index].feature !== FeatureTypes.Stone
      ) {
        extrasLayer[grid.player.index] = 'Raft';
      }
    }

    const py = Math.floor(grid.player.index / grid.width);
    const px = (grid.player.index % grid.width);
    for (let y = py - 2; y <= py + 2; y++) {
      for (let x = px - 2; x <= px + 2; x++) {
        if (this.inBounds(x, y, grid)) {
          visibleLayer[y * grid.width + x] = null;
        }
      }
    }

    return [backgroundLayer, foregroundLayer, wallLayer, extrasLayer, playerLayer, visibleLayer, visitedLayer, null];
  }

  revealMap() {
    this.visited = Array(this.grid.width * this.grid.height).fill(null);
    this.update('Revealed Map');
  }

  getWindow() {
    const grid = this.grid;
    const py = Math.floor(grid.player.index / grid.width);
    const px = (grid.player.index % grid.width);
    const size = 5;
    let windStr = '';

    const tileToChar = (x, y) => {
      const tile = grid.tiles[y * grid.width + x];
      if (tile.tile === TileTypes.Ground) {
        switch (tile.feature) {
          case FeatureTypes.Tree:  return 'T';
          case FeatureTypes.Axe:   return 'a';
          case FeatureTypes.Key:   return 'k';
          case FeatureTypes.Stone: return 'o';
          case FeatureTypes.Gold:  return 'g';
          case FeatureTypes.Dynamite: return 'd';
          case FeatureTypes.Wilson: return '?';
          default: return ' ';
        }
      } else if (tile.tile === TileTypes.Wall) {
        switch (tile.feature) {
          case FeatureTypes.Door:  return '-';
          default: return '*';
        }
      } else if (tile.tile === TileTypes.Water) {
        switch (tile.feature) {
          case FeatureTypes.Stone: return 'O';
          default: return '~';
        }
      }
    };

    for (let i = 0; i < size*size; ++i) {
      if (i % size === 0 && i !== 0) {
          windStr += '\n';
      }

      const [wx, wy] = [i % size - 2, Math.floor(i / size) - 2];
      let x, y;

      switch (grid.player.orientation) {
        case PlayerDirections.North: x = px + wx, y = py + wy; break;
        case PlayerDirections.South: x = px - wx, y = py - wy; break;
        case PlayerDirections.West : x = px + wy, y = py - wx; break;
        case PlayerDirections.East : x = px - wy, y = py + wx; break;
      }

      if (this.inBounds(x, y, grid)) {
        windStr += tileToChar(x, y);
      } else {
        windStr += '.';
      }
    }

    return windStr;
  }

  parse(stateString) {
    const rows   = stateString.split('\n').filter(row => row.length > 0);
    const height = rows.length;
    const width  = rows[0].length;
    const data   = [];

    rows.forEach(row => {
      if (row.length === width) {
        row.split('').forEach(cell => data.push(cell));
      } else {
        throw "Incorrect width";
      }
    });

    if (!this.startingState) {
      this.startingState = data.slice();
    }

    const tiles = data.map((cell, i) => {
      cell = this.fillExtraFeatures(cell, i);
      const orientation = this.calculateOrientation(cell, i, data, width, height);
      return new Tile(cell, orientation);
    });

    const player = this.findPlayer(data);

    return {
      width: width,
      height: height,
      tiles: tiles,
      player: player
    };
  }
}
