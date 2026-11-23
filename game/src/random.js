// A tiny seeded random source (mulberry32) so a game can be replayed from
// one seed: the deck shuffle and every draw follow from it.
export function createRandom(seed) {
  let value = seed >>> 0;
  return {
    next() {
      value = (value + 0x6d2b79f5) >>> 0;
      let mixed = value;
      mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
      mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
      return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    },
    intBelow(n) {
      return Math.floor(this.next() * n);
    },
  };
}
