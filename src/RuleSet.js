import {TileTypes, FeatureTypes, PlayerChars, InventoryTypes} from './Constants.js';

const PassableTerrain = [
  FeatureTypes.Empty,
  FeatureTypes.Stump,
  FeatureTypes.Start,
  FeatureTypes.Axe,
  FeatureTypes.Key,
  FeatureTypes.Dynamite,
  FeatureTypes.Gold,
  FeatureTypes.Exploded
];

export default class RuleSet {
  constructor(grid, inventory, explosions) {
    this.setState(grid, inventory, explosions);
  }

  setState(grid, inventory, explosions) {
    this.grid = grid;
    this.inventory = inventory;
    this.explosions = explosions;
  }

  iToCoord(i) {
    const x = (i % this.grid.width);
    const y = Math.floor(i / this.grid.width);

    return [x, y];
  }

  coordToI(coord) {
    const [x, y] = coord;

    if (!this.inBounds(x, y)) {
      return -1;
    } else {
      return y * this.grid.width + x;
    }
  }

  inBounds(x, y) {
    const [width, height] = [this.grid.width, this.grid.height];
    return (x >= 0 && x < width) && (y >= 0 && y < height);
  }

  north(i) {
    const [x, y] = this.iToCoord(i);
    return this.coordToI([x, y-1]);
  }

  south(i) {
    const [x, y] = this.iToCoord(i);
    return this.coordToI([x, y+1]);
  }

  west(i) {
    const [x, y] = this.iToCoord(i);
    return this.coordToI([x-1, y]);
  }

  east(i) {
    const [x, y] = this.iToCoord(i);
    return this.coordToI([x+1, y]);
  }

  perform(action) {
    let message = null;

    action = action.toLowerCase();

    const dir = this.grid.player.orientation;
    const index = this.grid.player.index;
    const facing = [
      'north', 'east', 'south', 'west'
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
        if (inFront < 0) {
          throw {
            type: 'dead',
            reason: 'outside'
          };
        }

        const oldLocation = this.grid.tiles[index];
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
          if (oldLocation.tile === TileTypes.Water && canMove) {
            // moving from water to ground
            message = 'Raft broke.';
            const inventoryAt = this.inventory.indexOf(InventoryTypes.Raft);
            this.inventory.splice(inventoryAt, 1);
          }
        } else if (tile === TileTypes.Wall) {
          if (feature === FeatureTypes.DoorOpen) {
            canMove = true;
          } else if (feature === FeatureTypes.Wall) {
            message = 'Walked into a wall.';
          } else if (feature === FeatureTypes.Door) {
            message = 'Door is locked.';
          }
          if (oldLocation.tile === TileTypes.Water && canMove) {
            // moving from water to doorway
            message = 'Raft broke.';
            const inventoryAt = this.inventory.indexOf(InventoryTypes.Raft);
            this.inventory.splice(inventoryAt, 1);
          }
        } else if (tile === TileTypes.Water) {
          if (this.inventory.includes(InventoryTypes.Raft)) {
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
          this.grid.player.index = inFront;

          const pickups = [FeatureTypes.Key, FeatureTypes.Axe, FeatureTypes.Dynamite, FeatureTypes.Gold];

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
          inFront >= 0 &&
          feature === FeatureTypes.Tree
        ) {
          // chop down the tree
          location.feature = FeatureTypes.Stump;
          if (this.inventory.includes(InventoryTypes.Raft)) {
            message = 'Chopped down a tree. Already have a raft.';
          } else {
            this.inventory.push(InventoryTypes.Raft);
            message = 'Chopped down a tree and made a raft.';
          }
        } else {
          message = 'Unable to chop.';
        }
      },

      u: () => {
        const location = this.grid.tiles[inFront];
        const feature = location.feature;

        if (
          this.inventory.includes(InventoryTypes.Key) &&
          inFront >= 0 &&
          feature === FeatureTypes.Door
        ) {
          // unlock the door
          location.feature = FeatureTypes.DoorOpen;
          message = 'Unlocked a door.';
        } else {
          message = 'Unable to unlock.';
        }
      },

      b: () => {
        const location = this.grid.tiles[inFront];

        if (
          this.inventory.includes(InventoryTypes.Dynamite) &&
          inFront >= 0 &&
          (
            location.tile === TileTypes.Wall ||
            location.feature === FeatureTypes.Tree
          )
        ) {
          if (location.tile === TileTypes.Wall) {
            message = 'Blasted wall.';
          } else {
            message = 'Blasted tree.';
          }
          location.tile = TileTypes.Ground;
          location.feature = FeatureTypes.Exploded;
          this.explosions.push(inFront);

          // hack to make walls click together properly
          const tileDirs = {
            n: [this.north(inFront), 'linkS'],
            s: [this.south(inFront), 'linkN'],
            e: [this.east(inFront), 'linkW'],
            w: [this.west(inFront), 'linkE']
          };
          Object.keys(tileDirs).forEach(key => {
            const [index, link] = tileDirs[key];
            const cell = this.grid.tiles[index];
            if (index >= 0 && cell.tile === TileTypes.Wall) {
              cell.orientation[link] = false;
            }
          });

          const inventoryAt = this.inventory.indexOf(InventoryTypes.Dynamite);
          this.inventory.splice(inventoryAt, 1);
        } else {
          if (!this.inventory.includes(InventoryTypes.Dynamite)) {
            message = 'No dynamite.';
          } else {
            message = 'Nothing to blow up.';
          }
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
