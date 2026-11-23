// Deck building: two copies of every card in the catalogue, shuffled with
// the seeded random source. Drawing from an empty deck reshuffles the
// discard pile, so a long duel never runs dry.
import { CARDS, DECK_COPIES } from './config.js';

export function buildDeck(random) {
  const deck = [];
  for (const card of CARDS) {
    for (let copy = 0; copy < DECK_COPIES; copy += 1) deck.push({ ...card, uid: `${card.id}-${copy}` });
  }
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const other = random.intBelow(index + 1);
    [deck[index], deck[other]] = [deck[other], deck[index]];
  }
  return deck;
}

export function drawCards(side, count, random) {
  const drawn = [];
  for (let n = 0; n < count; n += 1) {
    if (side.deck.length === 0) {
      if (side.discard.length === 0) break;
      side.deck = side.discard;
      side.discard = [];
      for (let index = side.deck.length - 1; index > 0; index -= 1) {
        const other = random.intBelow(index + 1);
        [side.deck[index], side.deck[other]] = [side.deck[other], side.deck[index]];
      }
    }
    drawn.push(side.deck.pop());
  }
  return drawn;
}
