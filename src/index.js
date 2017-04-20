import RogueGame from './RogueGame.js';

const demoState =
`
~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~
~~     T       t   k ~~
~~   ~~*     ***~~   ~~
~~*!*     v  *    *-*~~
~~  **       !   **  ~~
~~ g **** o  *  ** a ~~
~~     -       **    ~~
~~     *       *     ~~
~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~
`;

window.onload = () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new RogueGame(canvas, demoState);
  const gridWorld = game.gridWorld;

  window.onblur = () => gridWorld.stop();
  window.onfocus = () => gridWorld.run();
  window.onresize = () => gridWorld.hasModified = true;
  window.onkeydown = (e) => {
    const speed = 8;
    switch (e.keyCode) {
      case 38: gridWorld.pan(0, -speed); break;
      case 40: gridWorld.pan(0,  speed); break;
      case 37: gridWorld.pan(-speed, 0); break;
      case 39: gridWorld.pan(speed,  0); break;
      default: break;
    }
  }

  let dragStart = null;
  canvas.onmousedown = (e) => {
    const rect = canvas.getBoundingClientRect();
    dragStart = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      rect: rect
    };
    gridWorld.startDrag(dragStart.x, dragStart.y);
  };
  window.onmouseup = (e) => {
    dragStart = null;
  };
  window.onmousemove = (e) => {
    if (dragStart) {
      gridWorld.moveDrag(
        e.clientX - dragStart.rect.left,
        e.clientY - dragStart.rect.top
      );
    }
  }

  gridWorld.run();
};
