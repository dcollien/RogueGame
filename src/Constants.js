// Base background tile types
export const TileTypes = {
  Water: Symbol.for('Water'),
  Ground: Symbol.for('Ground'),
  Wall: Symbol.for('Wall')
};

// Features which may be on tiles
export const FeatureTypes = {
  Empty: Symbol.for('Empty'),
  Tree: Symbol.for('Tree'),
  Stump: Symbol.for('Stump'), // extra, shimmed in (for aesthetics)
  Start: Symbol.for('Start'), // extra, shimmed in (for aesthetics)
  Door: Symbol.for('Door'),
  DoorOpen: Symbol.for('DoorOpen'), // extra, shimmed in (for aesthetics)
  Stone: Symbol.for('Stone'),
  Axe: Symbol.for('Axe'),
  Key: Symbol.for('Key'),
  Gold: Symbol.for('Gold')
};

export const PlayerChars = ['^', '>', 'v', '<'];

export const PlayerDirections = {
  North: 0,
  East: 1,
  South: 2,
  West: 3
};

export const InventoryTypes = {
  Stone: Symbol.for('Stone'),
  Axe: Symbol.for('Axe'),
  Key: Symbol.for('Key'),
  Gold: Symbol.for('Gold')
};
