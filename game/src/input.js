// Keyboard and mouse, collected as queues the main loop drains once a
// frame. Clicks arrive in canvas pixels; keys arrive as short names.
export function createInput(canvas) {
  const keys = [];
  const clicks = [];
  const keyMap = {
    ' ': 'confirm',
    Enter: 'confirm',
    Escape: 'pause',
    p: 'pause',
    P: 'pause',
    e: 'end',
    E: 'end',
    r: 'restart',
    R: 'restart',
    m: 'mute',
    M: 'mute',
  };

  function onKey(event) {
    if (event.key >= '1' && event.key <= '7') {
      keys.push(`card${event.key}`);
      event.preventDefault();
      return;
    }
    const action = keyMap[event.key];
    if (action) {
      keys.push(action);
      event.preventDefault();
    }
  }

  function onClick(event) {
    const rect = canvas.getBoundingClientRect();
    clicks.push({
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    });
  }

  window.addEventListener('keydown', onKey);
  canvas.addEventListener('click', onClick);

  return {
    takeKeys() {
      return keys.splice(0, keys.length);
    },
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
  };
}
