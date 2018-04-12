import RogueGame from './RogueGame.js';
import {InventoryTypes} from './Constants';

const OL = window.OL;
const getEl = (id) => document.getElementById(id);

const uploadFile = (file, url, onLoad, onError) => {
  const xhr = new XMLHttpRequest();

  xhr.onload = onLoad;
  xhr.onerror = onError;

  xhr.open('PUT', url);
  xhr.overrideMimeType(file.type);
  xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
  xhr.setRequestHeader('Access-Control-Expose-Headers', 'Access-Control-Allow-Origin');
  xhr.send(file);
};

const init = () => {
  let artStyles = [];
  let selectedStyle = 0;
  if (OL) {
    OL.resize(720, true);
    OL.on('resize', () => {
      window.onresize();
    });
    // Running as OpenLearning widget
    let map;
    let spriteSheets = [{
        name: 'Robot in the Wilderness',
        url: 'assets/sprites.png'
      },
      {
        name: 'I drew this in MS Paint',
        url: 'assets/sprites2.png'
      }
    ];

    if (OL.mode === 'exhibit') {
      map = OL.exhibit.data.map;
      spriteSheets = OL.exhibit.data.sprites;
      selectedStyle = OL.exhibit.data.selectedStyle || 0;
    } else if (OL.user.data) {
      map = OL.user.data.map;
      spriteSheets = spriteSheets.concat(OL.user.data.sprites || []);
      selectedStyle = OL.user.data.selectedStyle || 0;

      const shareButton = getEl('editor-share');
      shareButton.style.display = '';
      shareButton.onclick = () => {
        const mapVal = getEl('edit-text').value;
        const rows = mapVal.trim().split('\n');

        if (rows.length === 0) {
          alert('Please enter a map to share');
          return;
        }

        const tempCanvas = document.createElement('canvas');
        const tmpCtx = tempCanvas.getContext('2d');
        const size = 14;

        tmpCtx.fillStyle = 'black';
        tmpCtx.font = size + 'px monospace';
        const bounds = tmpCtx.measureText(rows[0]);
        tempCanvas.width = bounds.width;
        const ySize = Math.floor(bounds.width/rows[0].length);
        tempCanvas.height = rows.length * ySize;
        tmpCtx.font = size + 'px monospace';

        rows.forEach((row, i) => {
          tmpCtx.fillText(row, 0, i * ySize);
        })
        const thumbnail = tempCanvas.toDataURL();

        OL.user.share('widget', {
          thumbnail: thumbnail,
          map: mapVal,
          sprites: artStyles,
          selectedStyle: selectedStyle
        });
      };
    }

    if (map) {
      getEl('edit-text').value = map;
    }

    if (spriteSheets && spriteSheets.length > 0) {
      artStyles = spriteSheets;
    }
  }

  const artStylesSelect = getEl('theme');
  artStyles.forEach((style, i) => {
    const option = document.createElement('option');
    option.text = style.name;
    option.value = style.url;
    artStylesSelect.appendChild(option);
  });

  if (OL && OL.mode === 'display') {
    const customOption = document.createElement('option');
    customOption.text = 'Custom: Upload your own';
    customOption.value = 'CUSTOM';
    artStylesSelect.appendChild(customOption);

    const uploadButton = getEl('theme-save');
    uploadButton.onclick = () => {
      const file = getEl('theme-file').files[0];

      if (file) {
        uploadButton.dataset.loading = 'true';
        OL.files.create('sprites.png', function(response) {
          var storageKey = response.storageKey;
          var uploadURL  = response.uploadURL;
          uploadFile(file, uploadURL, () => {
            OL.files.getURLs([storageKey], (urls) => {
              uploadButton.dataset.loading = 'false';
              const newStyle = {
                name: getEl('theme-name').value,
                url: urls[0]
              };
              artStyles.unshift(newStyle);
              const newOption = document.createElement('option');
              newOption.text = newStyle.name;
              newOption.value = newStyle.url;
              artStylesSelect.insertBefore(newOption, artStylesSelect.firstChild);
              artStylesSelect.value = newStyle.url;
              selectedStyle = 0;
              getEl('theme-upload').style.display = 'none';
            });
          });
        });
      }
    };
  }

  artStylesSelect.onchange = (evt) => {
    const selected = evt.target;
    if (selected.selectedIndex >= artStyles.length) {
      getEl('theme-upload').style.display = '';
      getEl('theme-name').value = '';
    } else {
      getEl('theme-upload').style.display = 'none';
      selectedStyle = selected.selectedIndex;
    }
  };

  artStylesSelect.value = artStyles[selectedStyle].url;


  let isEditorOpen = false;

  let gameState = getEl('edit-text').value;

  const canvas = getEl('gameCanvas');
  let spriteSheet = artStyles[selectedStyle].url;
  let log = '';
  const updateLog = () => {
    const logDisplay = getEl('log');
    logDisplay.innerText = log.trim();
    logDisplay.scrollTop = logDisplay.scrollHeight;
  };


  const initIcons = () => {
    const inventoryIcons = Array.from(getEl('inventory').getElementsByTagName("LI"));
    const iconPositions = {
      axe: [0, 0],
      key: [2, 2],
      dynamite: [6, 0],
      raft: [3, 3],
      gold: [7, 0]
    };
    const gridSize = 64;
    const gridWidth = 8;
    inventoryIcons.forEach(icon => {
      const pos = iconPositions[icon.id];
      const size = icon.offsetWidth < 50 ? 32 : 64;

      if (pos) {
        icon.style.backgroundImage = `url("${spriteSheet}")`;
        icon.style.backgroundSize = `${size * gridWidth}px`;
        icon.style.backgroundPosition = `${-pos[0] * size}px ${-pos[1] * size}px`;
      }
    });
  };
  initIcons();
  window.addEventListener('resize', () => {
    initIcons();
  });

  const onChange = (grid, inventory, visited, isGameOver, message, windowStr) => {
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

  const game = new RogueGame(canvas, gameState, spriteSheet, onChange);
  const gridWorld = game.gridWorld;


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
    if (document.activeElement.tagName === 'INPUT') return;

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

      case '0'.charCodeAt(0): game.revealMap(); break;
      default: break;
    }
  }

  let dragStart = null;
  const startDrag = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    dragStart = {
      x: clientX - rect.left,
      y: clientY - rect.top,
      rect: rect
    };
    gridWorld.startDrag(dragStart.x, dragStart.y);
  };
  const endDrag = () => {
    dragStart = null;
  };
  const moveDrag = (clientX, clientY) => {
    if (dragStart) {
      gridWorld.moveDrag(
        clientX - dragStart.rect.left,
        clientY - dragStart.rect.top
      );
    }
  };
  window.onmouseup = (e) => {
    endDrag();
  };
  window.onmousemove = (e) => {
    moveDrag(e.clientX, e.clientY);
  };
  canvas.onmousedown = (e) => {
    startDrag(e.clientX, e.clientY);
  };
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    if (!touch) return;
    startDrag(touch.clientX, touch.clientY);
  });
  canvas.addEventListener('touchend', (e) => {
    endDrag();
  });
  canvas.addEventListener('touchcancel', (e) => {
    endDrag();
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    if (!touch) return;
    moveDrag(touch.clientX, touch.clientY);
  });

  const closeEditor = () => {
    getEl('editor').style.display = 'none';
    isEditorOpen = false;
  };
  const openEditor = () => {
    if (OL) OL.user.logInteraction();

    getEl('editor').style.display = '';
    isEditorOpen = true;
  };

  getEl('close-editor').onclick = closeEditor;
  getEl('edit').onclick = openEditor;

  const loadMap = () => {
    gameState = getEl('edit-text').value;
    const theme = getEl('theme').value;

    if (theme === 'CUSTOM') {
      alert("No theme uploaded.");
    } else {
      try {
        spriteSheet = theme;
        gridWorld.changeSprites(theme);
        initIcons();
        game.loadState(gameState, [], []);
        getEl('editor').style.display = 'none';
        isEditorOpen = false;
      } catch (err) {
        //throw err;
        alert(err);
      }
    }
  };

  getEl('editor-save').onclick = loadMap;

  getEl('reset').onclick = () => {
    log = 'Reset.\n';
    updateLog();
    try {
      game.loadState(gameState, [], []);
    } catch (err) {
      alert(err);
    }
  };

  getEl('instructions-run').onclick = () => {
    const val = getEl('instructions-input').value;
    if (val.length === 0) {
      return;
    }
    game.performAction(val[0].toLowerCase());
    getEl('instructions-input').value = val.substring(1);
  };

  gridWorld.run();
};


window.onload = () => {
  if (OL) {
    OL(init);
  } else {
    init();
  }
};
