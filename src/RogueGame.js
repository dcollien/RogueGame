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
      'g': [TileTypes.Ground, FeatureTypes.Gold],
      'x': [TileTypes.Ground, FeatureTypes.Start], // extra, shimmed in
      ' ': [TileTypes.Ground, FeatureTypes.Empty],
      '-': [TileTypes.Wall,   FeatureTypes.Door],
      '!': [TileTypes.Wall,   FeatureTypes.DoorOpen], // extra, shimmed in
      '*': [TileTypes.Wall,   FeatureTypes.Empty],
      '~': [TileTypes.Water,  FeatureTypes.Empty],
      'O': [TileTypes.Water,  FeatureTypes.Stone],
      'd': [TileTypes.Ground, FeatureTypes.Dynamite],
      'D': [TileTypes.Ground, FeatureTypes.Exploded] // extra, shimmed in
    };

    const [tile, feature] = symbolMap[symbol];

    this.tile = tile;
    this.feature = feature;
    this.orientation = orientation;
  }

  getWallSymbol(feature, orientation, layer) {
    let prefix = null;
    let suffix = null;

    const isH = orientation.includes('H'); // horiz
    const isV = orientation.includes('V'); // vert
    const isE = orientation.includes('E'); // bottom-end
    const isA = orientation.includes('A'); // nothing left/right

    const isDoor = (this.feature === FeatureTypes.DoorOpen || this.feature === FeatureTypes.Door);

    if (layer === 0) {
      if (isH) {
        suffix = 'H';
      } else if (isA && isE && !isDoor) {
        suffix = 'VE';
      } else {
        suffix = 'V';
      }
    } else if (layer === 1) {
      if (isV && !isE && !isA) {
        suffix = 'V';
      }
    }

    if (suffix) {
      if (this.feature === FeatureTypes.Door && layer === 0) {
        prefix = 'DC' + suffix;
      } else if (this.feature === FeatureTypes.DoorOpen && layer === 0) {
        prefix = 'DO' + suffix;
      } else {
        prefix = suffix;
      }
    }

    if (prefix) {
      prefix = prefix + '-Wall';
    }

    return prefix;
  }

  getLayer(layer) {
    let prefix = null;
    let key = null;

    if (layer === 0) {
      if (this.tile === TileTypes.Water || this.tile === TileTypes.Ground) {
        key = Symbol.keyFor(this.tile);
      } else {
        // for putting ground under doorways
        key = Symbol.keyFor(TileTypes.Ground);
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
      }
    } else if (layer === 2 && this.tile === TileTypes.Wall) {
      key = this.getWallSymbol(this.feature, this.orientation, 0);
    } else if (layer === 3 && this.tile === TileTypes.Wall) {
      key = this.getWallSymbol(this.feature, this.orientation, 1);
    }

    return key;
  }
}

export default class RogueGame {
  constructor(canvas, stateString) {
    this.canvas = canvas;

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
      "sprites": {
        "Ground": "assets/grass.png",
        "Tree-Ground": "assets/tree.png",
        "Dynamite-Ground": "assets/dynamite.png",
        "Stone-Ground": "assets/rock.png",
        "Stone-Water": "assets/rock_water.png",
        "Exploded-Ground": "assets/burnt_grass.png",
        "Water": "assets/water.png",
        "H-Wall": "assets/wall-h.png",
        "V-Wall": "assets/wall-v.png",
        "T-Wall": "assets/wall-top.png",
        "VE-Wall": "assets/wall-end-v.png",
        "DCH-Wall": "assets/door-closed-h.png",
        "DOH-Wall": "assets/door-open-h.png",
        "DCV-Wall": "assets/door-closed-v.png",
        "DOV-Wall": "assets/door-open-v.png",
        "Stump-Ground": "assets/stump.png",
        "Axe-Ground": "assets/axe.png",
        "Key-Ground": "assets/key.png",
        "Gold-Ground": "assets/gold.png",
        "Start-Ground": "assets/start.png",
        "^": "assets/player-up.png",
        "v": "assets/player-down.png",
        "<": "assets/player-left.png",
        ">": "assets/player-right.png",
        "Raft": "assets/raft.png",
        "Unseen": {fill: 'rgba(0, 0, 0, 0.4)', stroke: 'rgba(96, 96, 96, 0.8)'},
        "Unvisited": {fill: 'rgba(0, 0, 0, 0.6)', stroke: 'rgba(32, 32, 32, 0.8)'}
      }
    });
  }

  loadState(stateString, visited=null, inventory=null, explosions=null) {
    this.explosions = [];

    if (explosions) {
      this.explosions = explosions;
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

    this.update(null);
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
      this.gridWorld.grid = this.createLayers(this.grid);
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

    let orientation = null;

    const wallPresent = (x, y) => {
      if ((x >= 0 && x < width) && (y >= 0 && y < height)) {
        return wallFeatures.includes(mapData[y * width + x]);
      } else {
        return false;
      }
    }

    if (wallFeatures.includes(cell)) {
      orientation = [];

      const y = Math.floor(i / width);
      const x = (i % width);

      const above = wallPresent(x, y - 1);
      const below = wallPresent(x, y + 1);
      const left  = wallPresent(x - 1, y);
      const right = wallPresent(x + 1, y);

      if (above || below) {
        orientation.push('V'); // vertical
      }
      if (left || right) {
        orientation.push('H'); // horizontal
      }
      if (above && !below) {
        orientation.push('E'); // bottom end
      }
      if ((above || below) && (!left && !right)) {
        orientation.push('A'); // alone
      }

      if (orientation.length === 0) {
        orientation.push('H');
      }
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
    const wallLayer1      = grid.tiles.map(tile => tile.getLayer(2));
    const wallLayer2      = grid.tiles.map(tile => tile.getLayer(3));
    const extrasLayer     = Array(grid.width * grid.height).fill(null);
    const playerLayer     = Array(grid.width * grid.height).fill(null);
    const visibleLayer    = Array(grid.width * grid.height).fill('Unseen');
    const visitedLayer    = this.visited;

    if (!this.isGameOver) {
      playerLayer[grid.player.index] = PlayerChars[grid.player.orientation];
      if (
        this.inventory.includes(InventoryTypes.Raft) &&
        grid.tiles[grid.player.index].tile === TileTypes.Water
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

    return [backgroundLayer, foregroundLayer, wallLayer1, wallLayer2, extrasLayer, playerLayer, visibleLayer, visitedLayer, null];
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
