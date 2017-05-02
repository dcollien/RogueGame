import Game from './Game.js';

const NORTH = 0;
const SOUTH = 1;
const EAST = 2;
const WEST = 3;

export default class GridWorld extends Game {
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
  constructor(canvas, initData) {
    super(canvas);
    this.gridWidth = initData.width;
    this.gridHeight = initData.height;
    this.gridSize = initData.size;
    this.background = initData.background || [];
    this.grid = initData.grid || [[]];
    for (const layer of this.grid) {
      if (layer) {
        layer.length = this.gridWidth * this.gridHeight;
      }
    }
    this.gridPan = initData.pan || [Math.floor(gridWidth/2), Math.floor(gridHeight/2)];
    this.loadSprites(initData.sprites, initData.spritesheet)
    this.hasModified = true;
  }

  changeLayers(layers=this.grid, width=this.gridWidth, height=this.gridHeight, size=this.gridSize) {
    this.grid = layers;
    this.gridWidth = width;
    this.gridHeight = height;
    this.gridSize = size;
  }

  changeSprites(spriteSheetUrl) {
    if (spriteSheetUrl) {
      if (this.spritesheet && spriteSheetUrl === this.spritesheet.src) {
        return;
      }
      this.spritesheet = new Image();
      this.spritesheet.src = spriteSheetUrl;
      this.spritesheet.onload = () => this.hasModified = true;
    }
  }

  loadSprites(sprites, spritesheet) {
    this.sprites = sprites || {};
    Object.keys(this.sprites).forEach(key => {
      if (typeof this.sprites[key] === 'string') {
        const image = new Image();
        image.src = this.sprites[key];
        image.onload = () => this.hasModified = true;
        this.sprites[key] = image;
      }
    });

    this.changeSprites(spritesheet)
  }

  update(dt) {
    return this.hasModified;
  }

  lookup(x, y) {
    return this.grid[y * this.gridWidth + x];
  }

  startDrag(x, y) {
    this.drag = {
      x: x,
      y: y,
      pan: {
        x: this.gridPan[0],
        y: this.gridPan[1]
      }
    };
  }

  moveDrag(x, y) {
    if (!this.drag) return;

    const gridDx = -(x - this.drag.x)/this.gridSize;
    const gridDy = -(y - this.drag.y)/this.gridSize;

    this.gridPan[0] = this.drag.pan.x + gridDx;
    this.gridPan[1] = this.drag.pan.y + gridDy;
    this.hasModified = true;
  }

  endDrag(x, y) {
    this.drag = null;
  }

  getPan() {
    return {
      x: this.gridPan[0] * this.gridSize,
      y: this.gridPan[1] * this.gridSize
    }
  }

  pan(dx, dy) {
    this.gridPan[0] -= dx/this.gridSize;
    this.gridPan[1] -= dy/this.gridSize;
    this.hasModified = true;
  }

  panTo(x, y) {
    this.gridPan[0] = x/this.gridSize;
    this.gridPan[1] = y/this.gridSize;
  }

  drawLayer(layer) {
    const ctx = this.context;
    const scale = this.gridSize;
    const offsetX = this.width /2 - this.gridPan[0] * scale;
    const offsetY = this.height/2 - this.gridPan[1] * scale;

    let x, y;
    let textWidth, sprite;

    ctx.font = `${scale/2}px sans-serif`;
    ctx.imageSmoothingEnabled= false;

    let gridI = 0;
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
          ctx.drawImage(sprite,
            0, 0, scale, scale,
            x, y, scale, scale
          );
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
            ctx.drawImage(this.spritesheet,
              sprite.sheet.x * scale, sprite.sheet.y * scale, scale, scale,
              x, y, scale, scale
            );
          }
        } else {
          textWidth = ctx.measureText(layer[gridI]).width;
          ctx.fillText(layer[gridI], x + scale/2 - textWidth/2, y + 5*scale/8);
        }
      }

      gridI++;
    }
  }

  draw() {
    const ctx = this.context;

    ctx.clearRect(0, 0, this.width, this.height);

    let layer;
    for (layer of this.grid) {
      this.drawLayer(layer)
    }

    this.hasModified = false;
  }
}
