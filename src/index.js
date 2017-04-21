import RogueGame from './RogueGame.js';
import {InventoryTypes} from './Constants';

window.onload = () => {
  const getEl = (id) => document.getElementById(id);
  let isEditorOpen = true;

  let gameState = getEl('edit-text').value;

  const canvas = getEl('gameCanvas');
  const game = new RogueGame(canvas, gameState);
  const gridWorld = game.gridWorld;
  let log = '';

  const actionButtons = {
    l: getEl('action-l'),
    r: getEl('action-r'),
    f: getEl('action-f'),
    c: getEl('action-c'),
    u: getEl('action-u'),
    b: getEl('action-b')
  };

  const actionHandler = (action) => (e) => game.performAction(action);

  Object.keys(actionButtons).forEach((key) => {
    actionButtons[key].onclick = actionHandler(key);
  });

  window.onblur = () => gridWorld.stop();
  window.onfocus = () => gridWorld.run();
  window.onresize = () => gridWorld.hasModified = true;
  window.onkeydown = (e) => {
    if (isEditorOpen) return;

    const speed = 8;
    switch (e.keyCode) {
      case 38: gridWorld.pan(0, -speed); break;
      case 40: gridWorld.pan(0,  speed); break;
      case 37: gridWorld.pan(-speed, 0); break;
      case 39: gridWorld.pan(speed,  0); break;
      case 'L'.charCodeAt(0): game.performAction('l'); break;
      case 'R'.charCodeAt(0): game.performAction('r'); break;
      case 'F'.charCodeAt(0): game.performAction('f'); break;
      case 'C'.charCodeAt(0): game.performAction('c'); break;
      case 'U'.charCodeAt(0): game.performAction('u'); break;
      case 'B'.charCodeAt(0): game.performAction('b'); break;

      case 'A'.charCodeAt(0): game.performAction('l'); break;
      case 'D'.charCodeAt(0): game.performAction('r'); break;
      case 'W'.charCodeAt(0): game.performAction('f'); break;
      case 'Q'.charCodeAt(0): game.performAction('c'); break;
      case 'E'.charCodeAt(0): game.performAction('u'); break;
      case 'S'.charCodeAt(0): game.performAction('b'); break;
      default: break;
    }
  }

  const updateLog = () => {
    const logDisplay = getEl('log');
    logDisplay.innerText = log.trim();
    logDisplay.scrollTop = logDisplay.scrollHeight;
  };

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
  };
  game.onChange = (grid, inventory, visited, isGameOver, message, windowStr) => {
    getEl('agent-window').innerText = windowStr;

    const inventoryItems = [
      {
        id: 'key',
        symbol: InventoryTypes.Key
      },
      {
        id: 'stone',
        symbol: InventoryTypes.Stone
      },
      {
        id: 'axe',
        symbol: InventoryTypes.Axe
      },
      {
        id: 'gold',
        symbol: InventoryTypes.Gold
      },
      {
        id: 'raft',
        symbol: InventoryTypes.Raft
      },
      {
        id: 'dynamite',
        symbol: InventoryTypes.Dynamite
      },
    ];

    inventoryItems.forEach((item) => {
      const element = getEl(item.id);
      let count = 0;
      inventory.forEach(inventoryItem => {
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

  getEl('close-editor').onclick = () => {
    getEl('editor').style.display = 'none';
    isEditorOpen = false;
  };

  getEl('edit').onclick = () => {
    getEl('editor').style.display = '';
    isEditorOpen = true;
  };

  getEl('editor-save').onclick = () => {
    gameState = getEl('edit-text').value;
    log = 'New map loaded.\n';
    updateLog();
    try {
      game.loadState(gameState, [], []);
      getEl('editor').style.display = 'none';
      isEditorOpen = false;
    } catch (err) {
      alert(err);
    }
  };

  getEl('reset').onclick = () => {
    log = 'Reset.\n';
    updateLog();
    try {
      game.loadState(gameState, [], []);
    } catch (err) {
      alert(err);
    }
  };

  gridWorld.run();
};
