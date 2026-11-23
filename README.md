# Emberfall Court

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/Shintya7/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/Shintya7/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

Emberfall Court — an original card duel that runs in a desktop browser from static files, with no network requests. You are the Ember Warden, duelling the Ashen Duchess across a green-baize court. Both sides hold 30 life and a 26-card deck drawn from four houses — Ember, Tide, Thorn and Star. Each turn refills your ember; spend it to play cards, and bring the Duchess to 0 life before she does the same to you.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## How to play

- **Click a card or press 1–7** — play it (only if you can pay its ember cost).
- **E or the END TURN button** — end your turn; the Duchess then plays hers, one card at a time.
- **P** — pause. **M** — mute. **R** — duel again after a win or a loss. **Space / click** — start.
- **Ember** refills each turn and grows by 1 (up to 10). You draw 2 cards at the start of your turn; your hand holds at most 7.
- **Guard** soaks damage before life does. **Heal** restores life, up to 30.
- **House bonus:** a second card of the same house in one turn gains +2 to its attack, guard or heal — chain a house to hit harder.
- **Score** is the damage you deal, plus your remaining life × 5 and 50 when you win. Your best score is kept in localStorage.

## The cards

Thirteen original cards in four houses, two copies of each in the deck:

- **Ember** — Cinder Imp (1, deal 3), Flame Lash (2, deal 5), Wildfire (5, deal 9).
- **Tide** — Tide Surge (2, deal 4, heal 2), Deep Current (3, deal 6), Still Water (1, heal 4), Insight (1, draw 2).
- **Thorn** — Thorn Snare (1, deal 2, +3 guard), Briar Wall (2, +6 guard), Ironbark (3, +9 guard).
- **Star** — Star Mend (2, heal 6), Starfall (4, deal 7), Kindle (0, +2 ember, draw 1).

The Duchess judges her own hand each turn: she heals when hurt, guards when exposed, and otherwise hits you with her hardest affordable card.

## Screenshots

- `screenshots/1-table.jpg` — the table mid-duel: both hands, life and ember totals, the court record (cover).
- `screenshots/2-title.jpg` — the title screen.
- `screenshots/3-win.jpg` — victory over the Duchess (score 193, 10 turns).
- `screenshots/4-loss.jpg` — defeat: the embers go cold (0 life, 6 turns).

## Layout

- `game/index.html` — the page and its canvas.
- `game/src/config.js` — the tuning: life, ember, the thirteen cards, the four houses.
- `game/src/world.js` — the rules: turns, ember, playing cards, the house bonus, guard, damage, the Duchess's turn, and how a duel ends.
- `game/src/deck.js` — deck building, shuffling and drawing (reshuffles the discard when empty).
- `game/src/render.js` — the table, both hands, the cards, the life and ember totals, and every screen.
- `game/src/shots.js` — the staged screenshot scenes behind `?shot=title|play|win|loss`, played by an autopilot through the real rules.
- `game/src/input.js`, `game/src/audio.js`, `game/src/random.js` — pointer/keyboard input, synthesised sounds, the seeded random source.
- `game/src/main.js` — the boot and the one loop; `?seed=N` fixes the deck shuffle.
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` and writes `dossier.json` with the vendored make.fun library.
- `vendor/makefun-game.ts` — the kit's copy, unchanged.
