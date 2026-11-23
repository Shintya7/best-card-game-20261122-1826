// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between four screens: title, play, paused and over. The rival's turn is
// paced out one card at a time so the player can follow it.
//
// ?seed=N fixes the deck shuffle. ?shot=title|play|win|loss (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY } from './config.js';
import { createAudio } from './audio.js';
import { createInput } from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';
import { createWorld, endPlayerTurn, enemyStep, playCard, startGame, stepWorld } from './world.js';

const STEP = 1 / 60;
const ENEMY_STEP_SECONDS = 0.65;
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const state = createWorld(seed);
state.selectedIndex = -1;
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, state);
  let painted = 0;
  function paint() {
    renderer.draw(state, scene.screen, scene.best);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  const audio = createAudio();
  let screen = SCREEN_TITLE;
  let best = readBest();
  let enemyTimer = 0;
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function beginDuel() {
    audio.unlock();
    startGame(state);
    state.selectedIndex = -1;
    enemyTimer = 0;
    screen = SCREEN_PLAY;
    announce(`Duel begun. Your turn. ${state.player.hand.length} cards in hand.`);
  }

  function endDuel() {
    screen = SCREEN_OVER;
    if (state.winner === 'player') {
      audio.win();
      announce(`Victory! Score ${state.score}. Best ${Math.max(best, state.score)}.`);
    } else {
      audio.lose();
      announce(`Defeat. Score ${state.score}. Best ${best}.`);
    }
    if (state.score > best) {
      best = state.score;
      saveBest(best);
    }
  }

  function tryPlayCard(index) {
    if (state.phase !== 'player') return;
    const card = state.player.hand[index];
    if (!card) return;
    if (card.cost > state.player.ember) {
      state.selectedIndex = index;
      announce(`${card.name} costs ${card.cost} ember; you have ${state.player.ember}.`);
      return;
    }
    const enemyLifeBefore = state.enemy.life;
    const enemyGuardBefore = state.enemy.guard;
    const events = playCard(state, state.player, index);
    state.selectedIndex = -1;
    if (card.attack) {
      audio.hit();
      const dealt = enemyLifeBefore + enemyGuardBefore - state.enemy.life - state.enemy.guard;
      state.floats.push({ x: 300, y: 100, text: `-${dealt}`, color: '#ff6b57', age: 0 });
    } else if (card.heal) {
      audio.heal();
    } else {
      audio.play();
    }
    if (events & 2) endDuel();
    else announce(`Played ${card.name}. ${state.player.ember} ember left.`);
  }

  function endTurn() {
    if (state.phase !== 'player') return;
    audio.draw();
    endPlayerTurn(state);
    enemyTimer = 0;
    announce('The Duchess takes her turn.');
  }

  function handleKeys() {
    for (const key of input.takeKeys()) {
      if (key === 'mute') {
        const muted = audio.toggleMute();
        announce(muted ? 'Muted.' : 'Sound on.');
      } else if (key === 'restart' && screen !== SCREEN_TITLE) {
        beginDuel();
      } else if (key === 'confirm') {
        audio.unlock();
        if (screen === SCREEN_TITLE || screen === SCREEN_OVER) beginDuel();
        else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
      } else if (key === 'pause' && (screen === SCREEN_PLAY || screen === SCREEN_PAUSED)) {
        screen = screen === SCREEN_PLAY ? SCREEN_PAUSED : SCREEN_PLAY;
        announce(screen === SCREEN_PAUSED ? 'Paused.' : 'Playing.');
      } else if (key === 'end' && screen === SCREEN_PLAY) {
        endTurn();
      } else if (key.startsWith('card') && screen === SCREEN_PLAY) {
        tryPlayCard(Number.parseInt(key.slice(4), 10) - 1);
      }
    }
  }

  function handleClicks() {
    for (const click of input.takeClicks()) {
      audio.unlock();
      if (screen === SCREEN_TITLE || screen === SCREEN_OVER) {
        beginDuel();
        continue;
      }
      if (screen !== SCREEN_PLAY) continue;
      const placed = renderer.layout(state);
      const button = placed.endTurn;
      if (click.x >= button.x && click.x <= button.x + button.w && click.y >= button.y && click.y <= button.y + button.h) {
        endTurn();
        continue;
      }
      for (const rect of placed.playerCards) {
        if (click.x >= rect.x && click.x <= rect.x + rect.w && click.y >= rect.y - 18 && click.y <= rect.y + rect.h) {
          tryPlayCard(rect.index);
          break;
        }
      }
    }
  }

  function stepEnemy(dt) {
    if (state.phase !== 'enemy' || screen !== SCREEN_PLAY) return;
    enemyTimer += dt;
    while (enemyTimer >= ENEMY_STEP_SECONDS && state.phase === 'enemy') {
      enemyTimer -= ENEMY_STEP_SECONDS;
      const playerLifeBefore = state.player.life;
      const playerGuardBefore = state.player.guard;
      const result = enemyStep(state);
      const dealt = playerLifeBefore + playerGuardBefore - state.player.life - state.player.guard;
      if (dealt > 0) {
        audio.hit();
        state.floats.push({ x: 300, y: 470, text: `-${dealt}`, color: '#ff6b57', age: 0 });
      } else if (result === 'played') {
        audio.play();
      }
      if (state.phase === 'over') endDuel();
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleKeys();
    handleClicks();
    while (accumulator >= STEP) {
      if (screen === SCREEN_PLAY) {
        stepEnemy(STEP);
        stepWorld(state, STEP);
        if (state.phase === 'over' && screen === SCREEN_PLAY) endDuel();
      }
      accumulator -= STEP;
    }
    renderer.draw(state, screen, best);
  }

  announce('Emberfall Court. Press Space or click to begin the duel.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
