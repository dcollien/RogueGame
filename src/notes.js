
class RogueGame {
  constructor(canvas, stateString) {
    this.canvas = canvas;
    this.startingState = this.parseState(stateString);
    this.state = this.parseState(stateString);
    this.background = this.determineBackground(this.startingState);
    this.inventory = {};
    this.grid = this.calculateGrid(stateString);
    this.gridWorld = new GridWorld(this.canvas, {
      "width": this.grid.width,
      "height": this.grid.height,
      "size": 64,
      "pan": [this.grid.width / 2, this.grid.height / 2],
      "grid": this.grid.layers,
      "sprites": {
        " ": "assets/grass.png",
        "T": "assets/tree.png",
        "o": "assets/rock.png",
        "O": "assets/rock_water.png",
        "~": "assets/water.png",
        "*": "assets/wall-h.png",
        "+": "assets/wall-v.png",
        "#": "assets/wall-top.png",
        "%": "assets/wall-end-v.png",
        "-": "assets/door-closed-h.png",
        "_": "assets/door-open-h.png",
        "|": "assets/door-closed-v.png",
        "!": "assets/door-open-v.png",
        "t": "assets/stump.png",
        "a": "assets/axe.png",
        "k": "assets/key.png",
        "g": "assets/gold.png",
        "x": "assets/start.png",
        "f": {fill: 'rgba(0, 0, 0, 0.4)', stroke: 'rgba(96, 96, 96, 0.8)'},
        "F": {fill: 'rgba(0, 0, 0, 0.8)', stroke: 'rgba(32, 32, 32, 0.8)'}
      }
    });
  }

  parseState(stateString) {
    const rows = stateString.trim().split('\n');
    const height = rows.length;
    const width = rows[0].length;
    const data = [];

    rows.forEach(row => row.split('').forEach(cell => data.push(cell)));

    return {
      width: width,
      height: height,
      data: data
    };
  }

  determineBackground(state) {
    const playerChars = ['v', '>', '<', '^'];
    return [
      state.data.map(cell => cell === '~' || cell == 'O' ? '~' : ' '),
      state.data.map(cell => playerChars.includes(cell) ? 'x' : null )
    ]
  }

  calculateGrid(stateString) {
    const startState = this.startingState;
    const currState = this.state;
    const newState = this.parseState(stateString);

    const characterTransitions = {
      prev: {
        'O': 'O', // placed stones in prev state -> stone under character
        '~': this.inventory['o'] ? 'O' : null // place stone if water
      }
    };

    const emptyTransitions = {
      // compare to starting state
      start: {
        '-': '_', // closed doorways become open doorways
        'T': 't', // trees become stumps
        // character starting position
        'v': 'x',
        '>': 'x',
        '<': 'x',
        '^': 'x'
      }
    };
    const featureRules = {
      'T': true,
      'o': true,
      'O': true,
      'g': true,
      'a': true,
      'k': true,
      '-': true,
      ' ': emptyTransitions,
      '*': true,
      'v': characterTransitions,
      '>': characterTransitions,
      '<': characterTransitions,
      '^': characterTransitions
    };

    const wallLookup = {};

    const features = newState.data.map((cell, i) => {
      const rule = featureRules[cell];
      const startCell = startState.data[i];
      const prevCell = currState.data[i];
      if (rule === true) {
        return cell;
      } else if (rule) {
        if (rule.start && rule.start[startCell]) {
          return rule.start[startCell];
        } else if (rule.prev && rule.prev[prevCell]) {
          return rule.prev[prevCell];
        } else if (typeof rule === 'string') {
          return rule;
        } else {
          return cell
        }
      }
      return null;
    });
    const character = newState.data.map(
      cell =>
        cell === '^' || cell === 'v' || cell === '<' || cell === '>' ? cell : null
    );

    const layers = this.background.concat([
      features,
      character,
      null
    ]);

    return {
      width: newState.width,
      height: newState.height,
      layers: layers
    };
  }
}
