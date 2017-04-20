const requestAnimationFrame = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  (callback => window.setTimeout(callback, 1000 / 60))
;

const cancelAnimationFrame = window.cancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  window.mozCancelAnimationFrame ||
  window.oCancelAnimationFrame ||
  window.msCancelAnimationFrame ||
  window.clearTimeout
;

export default class Game {
  constructor(canvas) {
    if (new.target === Game) {
      throw new TypeError("Cannot construct an abstract class");
    }

    if (typeof canvas === 'string') {
      this.canvas = document.getElementById(canvas);
      if (!this.canvas) throw new Error(`Unable to find element with ID: ${canvas}`);
    } else {
      this.canvas = canvas;
    }

    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.context = this.canvas.getContext('2d');

    window.onresize = (e) => {
      this.canvas.width = window.innerWidth
      this.canvas.height = window.innerHeight
      this.width = this.canvas.width
      this.height = this.canvas.height
    };
    window.onresize();

    this.running = false;
    this.frameRequest = null;
  }

  update(dt) {
    throw new TypeError("Not Implemented: update method is required");
  }

  draw() {
    throw new TypeError("Not Implemented: draw method is required");
  }

  run() {
    if (this.running) return;

    this.running = true;
    const processFrame = () => {
      this.step();
      this.frameRequest = requestAnimationFrame(processFrame);
    };

    this.lastStep = Date.now();
    this.frameRequest = requestAnimationFrame(processFrame);
  }

  stop() {
    if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
    this.frameRequest = null;
    this.running = false;
  }

  step() {
    const now = Date.now();
    const dt = (now - this.lastStep) / 1000;
    this.lastStep = now;
    if (this.update(dt) !== false) {
      this.draw();
    }
  }
}
