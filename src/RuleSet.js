import {TileTypes, FeatureTypes, PlayerChars, InventoryTypes} from './Constants.js';


const PassableTerrain = [
  FeatureTypes.Empty,
  FeatureTypes.Stump,
  FeatureTypes.Start,
  FeatureTypes.Stone,
  FeatureTypes.Axe,
  FeatureTypes.Key,
  FeatureTypes.Gold
];

export default class RuleSet {
  constructor(grid, inventory) {
    this.setState(grid, inventory);
  }

  setState(grid, inventory) {
    this.grid = grid;
    this.inventory = inventory;
  }

  iToCoord(i) {
    const x = (i % this.grid.width);
    const y = Math.floor(i / this.grid.width);

    return [x, y];
  }

  coordToI(coord) {
    const [x, y] = coord;

    return y * this.grid.width + x;
  }

  inBounds(i) {
    const [x, y] = this.iToCoord(i);
    const [width, height] = [this.grid.width, this.grid.height];
    return (x >= 0 && x < width) && (y >= 0 && y < height);
  }

  up(i) {
    const [x, y] = this.iToCoord(i);
    return this.coordToI([x, y-1]);
  }

  down(i) {
    const [x, y] = this.iToCoord(i);
    return this.coordToI([x, y+1]);
  }

  left(i) {
    const [x, y] = this.iToCoord(i);
    return this.coordToI([x-1, y]);
  }

  right(i) {
    const [x, y] = this.iToCoord(i);
    return this.coordToI([x+1, y]);
  }

  perform(action) {
    let message = null;

    action = action.toLowerCase();

    const dir = this.grid.player.orientation;
    const index = this.grid.player.index;
    const facing = [
      'up', 'right', 'down', 'left'
    ][dir];
    const inFront = this[facing](index);

    const actions = {
      r: () => {
        this.grid.player.orientation = (dir + 1) % 4;
        message = 'Turned right.';
      },

      l: () => {
        this.grid.player.orientation = (dir === 0) ? 3 : (dir - 1);
        message = 'Turned left.';
      },

      f: () => {
        const location = this.grid.tiles[inFront];
        const tile = location.tile;
        const feature = location.feature;

        let canMove = false;

        if (tile === TileTypes.Ground) {
          // moving on ground
          if (PassableTerrain.includes(feature)) {
            canMove = true;
          } else {
            message = 'Blocked by: ' + Symbol.keyFor(feature);
          }
          if (feature === FeatureTypes.Start && this.inventory.includes(InventoryTypes.Gold)) {
            message = true;
            const inventoryAt = this.inventory.indexOf(InventoryTypes.Gold);
            this.inventory.splice(inventoryAt, 1);
          }
        } else if (tile === TileTypes.Wall) {
          if (feature === FeatureTypes.DoorOpen) {
            canMove = true;
          } else if (feature === FeatureTypes.Empty) {
            message = 'Walked into a wall.';
          } else if (feature === FeatureTypes.Door) {
            message = 'Door is locked.';
          }
        } else if (tile === TileTypes.Water) {
          // moving on water
          if (feature === FeatureTypes.Empty) {
            if (this.inventory.includes(InventoryTypes.Stone)) {
              // place a stone
              location.feature = FeatureTypes.Stone;
              const inventoryAt = this.inventory.indexOf(InventoryTypes.Stone);
              this.inventory.splice(inventoryAt, 1);
              message = 'Placed a stone.';
              canMove = true;
            }
          }

          if (location.feature === FeatureTypes.Stone) {
            canMove = true;
          } else {
            throw {
              type: 'dead',
              reason: 'drowned'
            };
          }
        }

        if (!this.inBounds(inFront)) {
          throw {
            type: 'dead',
            reason: 'outside'
          };
        } else if (canMove) {
          this.grid.player.index = inFront;

          const pickups = [FeatureTypes.Key, FeatureTypes.Axe, FeatureTypes.Stone, FeatureTypes.Gold];

          if (tile === TileTypes.Ground && pickups.includes(location.feature)) {
            this.inventory.push(location.feature);
            message = 'Picked up: ' + Symbol.keyFor(location.feature);
            location.feature = FeatureTypes.Empty;
          }

          if (!message) {
            message = 'Moved forward.';
          }
        }
      },

      c: () => {
        const location = this.grid.tiles[inFront];
        const feature = location.feature;

        if (
          this.inventory.includes(InventoryTypes.Axe) &&
          this.inBounds(inFront) &&
          feature === FeatureTypes.Tree
        ) {
          // chop down the tree
          location.feature = FeatureTypes.Stump;
          message = 'Chopped down a tree.';
        } else {
          message = 'Unable to chop.';
        }
      },

      u: () => {
        const location = this.grid.tiles[inFront];
        const feature = location.feature;

        if (
          this.inventory.includes(InventoryTypes.Key) &&
          this.inBounds(inFront) &&
          feature === FeatureTypes.Door
        ) {
          // unlock the door
          location.feature = FeatureTypes.DoorOpen;
          message = 'Unlocked a door.';
        } else {
          message = 'Unable to unlock.';
        }
      }
    };

    const delegate = actions[action];

    if (delegate) {
      delegate();
    }

    return message;
  }
}
