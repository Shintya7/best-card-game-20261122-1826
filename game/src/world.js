// Emberfall Court rules: turns, ember, playing cards, the house bonus,
// guard, damage, healing, the rival's turn, and how a duel ends.
// Pure state and functions: no canvas, no DOM, so the same code drives
// the live game and the staged screenshot scenes.
import { CARDS, HOUSE_BONUS, MAX_HAND, START_LIFE } from './config.js';
import { buildDeck, drawCards } from './deck.js';
import { createRandom } from './random.js';

export const PHASE_TITLE = 'title';
export const PHASE_PLAYER = 'player';
export const PHASE_ENEMY = 'enemy';
export const PHASE_OVER = 'over';

export const EVENT_NONE = 0;
export const EVENT_PLAYED = 1;
export const EVENT_OVER = 2;

function makeSide(random) {
  return {
    life: START_LIFE,
    guard: 0,
    ember: 0,
    maxEmber: 0,
    deck: buildDeck(random),
    hand: [],
    discard: [],
    houses: [],
  };
}

export function createWorld(seed) {
  const random = createRandom(seed);
  const state = {
    seed,
    random,
    phase: PHASE_TITLE,
    turn: 0,
    winner: null,
    score: 0,
    cardsPlayed: 0,
    damageDealt: 0,
    log: [],
    floats: [],
  };
  state.player = makeSide(random);
  state.enemy = makeSide(random);
  return state;
}

export function resetWorld(state) {
  const fresh = createWorld(state.seed);
  for (const key of Object.keys(fresh)) state[key] = fresh[key];
}

function say(state, text) {
  state.log.push(text);
  if (state.log.length > 5) state.log.shift();
}

export function floatText(state, x, y, text, color) {
  state.floats.push({ x, y, text, color, age: 0 });
}

// A card's effect this turn: +2 to attack, guard and heal when another
// card of its house was already played this turn by the same side.
export function boostedEffect(card, side) {
  const sameHouse = side.houses.includes(card.house);
  const bonus = sameHouse ? HOUSE_BONUS : 0;
  return {
    attack: (card.attack ?? 0) + ((card.attack ?? 0) > 0 ? bonus : 0),
    guard: (card.guard ?? 0) + ((card.guard ?? 0) > 0 ? bonus : 0),
    heal: (card.heal ?? 0) + ((card.heal ?? 0) > 0 ? bonus : 0),
    draw: card.draw ?? 0,
    ember: card.ember ?? 0,
    boosted: sameHouse,
  };
}

export function cardText(card) {
  const parts = [];
  if (card.attack) parts.push(`Deal ${card.attack}`);
  if (card.guard) parts.push(`+${card.guard} guard`);
  if (card.heal) parts.push(`Heal ${card.heal}`);
  if (card.draw) parts.push(`Draw ${card.draw}`);
  if (card.ember) parts.push(`+${card.ember} ember`);
  return parts.join(' · ');
}

function dealDamage(state, target, amount, sourceName) {
  let left = amount;
  if (target.guard > 0) {
    const soaked = Math.min(target.guard, left);
    target.guard -= soaked;
    left -= soaked;
  }
  if (left > 0) target.life = Math.max(0, target.life - left);
  return left;
}

function otherSide(state, side) {
  return side === state.player ? state.enemy : state.player;
}

function isPlayerSide(state, side) {
  return side === state.player;
}

// Play the card at handIndex for side. Returns an event bitmask.
export function playCard(state, side, handIndex) {
  const card = side.hand[handIndex];
  if (!card || side.ember < card.cost) return EVENT_NONE;
  const foe = otherSide(state, side);
  const effect = boostedEffect(card, side);
  side.ember -= card.cost;
  side.hand.splice(handIndex, 1);
  side.discard.push(card);
  side.houses.push(card.house);
  state.cardsPlayed += 1;

  const who = isPlayerSide(state, side) ? 'You' : 'The Duchess';
  const bits = [];
  if (effect.attack > 0) {
    const dealt = dealDamage(state, foe, effect.attack, who);
    bits.push(`-${effect.attack}`);
    if (isPlayerSide(state, side)) {
      state.damageDealt += dealt;
      state.score += dealt;
    }
    say(state, `${who} played ${card.name}: ${effect.attack} damage${effect.boosted ? ' (house bonus +2)' : ''}.`);
  }
  if (effect.guard > 0) {
    side.guard += effect.guard;
    say(state, `${who} played ${card.name}: +${effect.guard} guard${effect.boosted ? ' (house bonus +2)' : ''}.`);
  }
  if (effect.heal > 0) {
    side.life = Math.min(START_LIFE, side.life + effect.heal);
    say(state, `${who} played ${card.name}: healed ${effect.heal}${effect.boosted ? ' (house bonus +2)' : ''}.`);
  }
  if (effect.draw > 0) {
    const drawn = drawCards(side, effect.draw, state.random);
    for (const c of drawn) if (side.hand.length < MAX_HAND) side.hand.push(c);
    say(state, `${who} played ${card.name}: drew ${drawn.length}.`);
  }
  if (effect.ember > 0) {
    side.ember += effect.ember;
    say(state, `${who} played ${card.name}: +${effect.ember} ember.`);
  }
  if (foe.life <= 0) {
    state.phase = PHASE_OVER;
    state.winner = isPlayerSide(state, side) ? 'player' : 'enemy';
    if (state.winner === 'player') state.score += state.player.life * 5 + 50;
    return EVENT_PLAYED | EVENT_OVER;
  }
  return EVENT_PLAYED;
}

export function startGame(state) {
  resetWorld(state);
  state.phase = PHASE_PLAYER;
  state.turn = 1;
  state.player.maxEmber = 1;
  state.player.ember = 1;
  state.enemy.maxEmber = 1;
  state.enemy.ember = 1;
  state.player.hand = drawCards(state.player, 4, state.random);
  state.enemy.hand = drawCards(state.enemy, 4, state.random);
  say(state, 'The duel begins. Your turn: play cards, then end your turn.');
}

function beginTurn(state, side) {
  side.maxEmber = Math.min(10, side.maxEmber + 1);
  side.ember = side.maxEmber;
  side.houses = [];
  const drawn = drawCards(side, 2, state.random);
  for (const card of drawn) if (side.hand.length < MAX_HAND) side.hand.push(card);
}

export function beginPlayerTurn(state) {
  state.turn += 1;
  state.phase = PHASE_PLAYER;
  beginTurn(state, state.player);
  say(state, `Turn ${state.turn}: your move — ${state.player.ember} ember, drew 2.`);
}

export function endPlayerTurn(state) {
  state.phase = PHASE_ENEMY;
  beginTurn(state, state.enemy);
  say(state, 'The Duchess takes her turn…');
}

// The rival's judgement: score every affordable card and play the best.
// Heal when hurt, guard when exposed, attack hardest otherwise; Kindle
// and Insight set up the next play.
export function enemyChoose(state) {
  const foe = state.enemy;
  let bestIndex = -1;
  let bestValue = 0;
  for (let index = 0; index < foe.hand.length; index += 1) {
    const card = foe.hand[index];
    if (card.cost > foe.ember) continue;
    const effect = boostedEffect(card, foe);
    let value = 0;
    if (effect.attack > 0) value += effect.attack * 1.2;
    if (effect.guard > 0) value += effect.guard * (state.player.life > 15 ? 0.7 : 1.0);
    if (effect.heal > 0) value += effect.heal * (foe.life <= 15 ? 1.6 : 0.6);
    if (effect.draw > 0) value += effect.draw * 1.5;
    if (effect.ember > 0) value += effect.ember * 1.8;
    value -= card.cost * 0.4;
    if (value > bestValue) {
      bestValue = value;
      bestIndex = index;
    }
  }
  return bestIndex;
}

// One rival step: play its best card, or hand the turn back when it has
// nothing worth playing. Returns 'played' or 'done'.
export function enemyStep(state) {
  const index = enemyChoose(state);
  if (index < 0) {
    beginPlayerTurn(state);
    return 'done';
  }
  playCard(state, state.enemy, index);
  return 'played';
}

// A decent human policy for the staged scenes: play the strongest
// affordable card each step, preferring attacks, then end the turn.
export function playerAutoplay(state) {
  let guard = 0;
  while (guard < 8) {
    guard += 1;
    let bestIndex = -1;
    let bestValue = 0;
    for (let index = 0; index < state.player.hand.length; index += 1) {
      const card = state.player.hand[index];
      if (card.cost > state.player.ember) continue;
      const effect = boostedEffect(card, state.player);
      let value = 0;
      if (effect.attack > 0) value += effect.attack * 1.3;
      if (effect.guard > 0) value += effect.guard * (state.player.life < 18 ? 1.1 : 0.5);
      if (effect.heal > 0) value += effect.heal * (state.player.life < 20 ? 1.4 : 0.3);
      if (effect.draw > 0) value += effect.draw * 1.2;
      if (effect.ember > 0) value += effect.ember * 1.6;
      value -= card.cost * 0.3;
      if (value > bestValue) {
        bestValue = value;
        bestIndex = index;
      }
    }
    if (bestIndex < 0) break;
    const events = playCard(state, state.player, bestIndex);
    if (events & EVENT_OVER) return 'over';
  }
  return 'played';
}

export function stepWorld(state, dt) {
  for (const float of state.floats) float.age += dt;
  state.floats = state.floats.filter((float) => float.age < 1.4);
}

export { CARDS };
