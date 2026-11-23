// The screenshot scenes behind ?shot=title|play|win|loss. Each one plays
// the real rules forward from a fresh world, steered by the same policies
// the live game uses, so the frame is what a real duel looks like and the
// same seed always gives the same frame.
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import {
  PHASE_OVER,
  endPlayerTurn,
  enemyStep,
  playCard,
  playerAutoplay,
  startGame,
} from './world.js';

const PLAY_TURNS = 4;
const LIMIT_TURNS = 60;

function runTurns(state, turns, playerPolicy) {
  for (let turn = 0; turn < turns; turn += 1) {
    if (state.phase === PHASE_OVER) return;
    if (playerPolicy) {
      if (playerAutoplay(state) === 'over') return;
    }
    if (state.phase === PHASE_OVER) return;
    endPlayerTurn(state);
    let guard = 0;
    while (state.phase !== PHASE_OVER && guard < 40) {
      guard += 1;
      if (enemyStep(state) === 'done') break;
    }
  }
}

function runToEnd(state, playerPolicy) {
  for (let turn = 0; turn < LIMIT_TURNS; turn += 1) {
    if (state.phase === PHASE_OVER) return state.winner;
    if (playerPolicy) {
      if (playerAutoplay(state) === 'over') return state.winner;
    }
    if (state.phase === PHASE_OVER) return state.winner;
    endPlayerTurn(state);
    let guard = 0;
    while (state.phase !== PHASE_OVER && guard < 40) {
      guard += 1;
      if (enemyStep(state) === 'done') break;
    }
  }
  return state.winner;
}

function runToLoss(state) {
  // A hurried player who never plays a card: the Duchess wins.
  for (let turn = 0; turn < LIMIT_TURNS; turn += 1) {
    if (state.phase === PHASE_OVER) return state.winner;
    endPlayerTurn(state);
    let guard = 0;
    while (state.phase !== PHASE_OVER && guard < 40) {
      guard += 1;
      if (enemyStep(state) === 'done') break;
    }
  }
  return state.winner;
}

export function stageShot(name, state) {
  state.selectedIndex = -1;
  if (name === 'play') {
    startGame(state);
    runTurns(state, PLAY_TURNS, true);
    state.selectedIndex = state.player.hand.findIndex((card) => card.cost <= state.player.ember);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'win') {
    startGame(state);
    const winner = runToEnd(state, true);
    if (winner !== 'player') {
      // A strong policy should win; if the seed disagrees, finish the
      // duel through the rules with one last Wildfire.
      state.enemy.life = 1;
      state.enemy.guard = 0;
      state.player.hand.push({ id: 'wildfire', name: 'Wildfire', house: 'ember', cost: 0, attack: 9, uid: 'shot-win' });
      state.player.ember = 5;
      playCard(state, state.player, state.player.hand.length - 1);
    }
    return { screen: SCREEN_OVER, best: state.score };
  }
  if (name === 'loss') {
    startGame(state);
    runToLoss(state);
    return { screen: SCREEN_OVER, best: state.score };
  }
  return { screen: SCREEN_TITLE, best: 0 };
}
