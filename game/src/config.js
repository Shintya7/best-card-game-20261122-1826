// Emberfall Court: every number that tunes the duel lives here.
// The game is an original card duel: the Ember Warden against the Ashen
// Duchess. Both sides hold 30 life, draw from a 24-card deck, spend ember
// to play cards, and win by bringing the other side to 0 life.
export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;

export const START_LIFE = 30;
export const MAX_HAND = 7;
export const DECK_COPIES = 2;
export const HOUSE_BONUS = 2;
export const BEST_KEY = 'emberfall-court-best';

export const HOUSES = {
  ember: { name: 'Ember', color: '#e2543e', dark: '#8f2418', light: '#ffb199', glyph: 'flame' },
  tide: { name: 'Tide', color: '#3e8fd9', dark: '#174a7d', light: '#a8d2f5', glyph: 'drop' },
  thorn: { name: 'Thorn', color: '#4da34d', dark: '#1f5c22', light: '#b5e3b0', glyph: 'leaf' },
  star: { name: 'Star', color: '#d9a53e', dark: '#7d5a12', light: '#ffe1a1', glyph: 'star' },
};

// One card: a cost in ember and an effect. attack hits the other side,
// guard soaks damage, heal restores life, draw pulls cards, ember adds
// ember for this turn. A card gains +2 to attack, guard and heal when
// another card of its house was already played this turn.
export const CARDS = [
  { id: 'cinder-imp', name: 'Cinder Imp', house: 'ember', cost: 1, attack: 3 },
  { id: 'flame-lash', name: 'Flame Lash', house: 'ember', cost: 2, attack: 5 },
  { id: 'wildfire', name: 'Wildfire', house: 'ember', cost: 5, attack: 9 },
  { id: 'tide-surge', name: 'Tide Surge', house: 'tide', cost: 2, attack: 4, heal: 2 },
  { id: 'deep-current', name: 'Deep Current', house: 'tide', cost: 3, attack: 6 },
  { id: 'still-water', name: 'Still Water', house: 'tide', cost: 1, heal: 4 },
  { id: 'insight', name: 'Insight', house: 'tide', cost: 1, draw: 2 },
  { id: 'thorn-snare', name: 'Thorn Snare', house: 'thorn', cost: 1, attack: 2, guard: 3 },
  { id: 'briar-wall', name: 'Briar Wall', house: 'thorn', cost: 2, guard: 6 },
  { id: 'ironbark', name: 'Ironbark', house: 'thorn', cost: 3, guard: 9 },
  { id: 'star-mend', name: 'Star Mend', house: 'star', cost: 2, heal: 6 },
  { id: 'starfall', name: 'Starfall', house: 'star', cost: 4, attack: 7 },
  { id: 'kindle', name: 'Kindle', house: 'star', cost: 0, ember: 2, draw: 1 },
];

export const PLAYER_NAME = 'Ember Warden';
export const ENEMY_NAME = 'The Ashen Duchess';
export const GAME_TITLE = 'EMBERFALL COURT';
