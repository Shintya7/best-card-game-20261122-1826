# Emberfall Court — dossier

## What it is

An original turn-based card duel for the desktop browser, built from static
files with no network requests. The player is the Ember Warden; the rival is
the Ashen Duchess, played by a heuristic AI. Both sides hold 30 life, a
26-card deck, and ember that refills and grows each turn.

## The rules

- Each turn: ember refills to a cap that grows by 1 per turn (maximum 10);
  the side draws 2 cards (hand maximum 7).
- Playing a card costs its ember. Attack deals damage, guard soaks damage
  before life, heal restores life (maximum 30), draw pulls cards, and Kindle
  adds ember for the turn.
- House bonus: the second card of the same house played in one turn gains +2
  to its attack, guard or heal. The four houses are Ember, Tide, Thorn and
  Star, each with its own colour and glyph.
- A side that runs out of deck reshuffles its discard pile.
- The duel ends when a side reaches 0 life. Score is damage dealt, plus
  remaining life × 5 and 50 on a win. Best score persists in localStorage.

## The cards (13, two copies each)

Ember: Cinder Imp (1, deal 3), Flame Lash (2, deal 5), Wildfire (5, deal 9).
Tide: Tide Surge (2, deal 4, heal 2), Deep Current (3, deal 6), Still Water
(1, heal 4), Insight (1, draw 2). Thorn: Thorn Snare (1, deal 2, +3 guard),
Briar Wall (2, +6 guard), Ironbark (3, +9 guard). Star: Star Mend (2, heal
6), Starfall (4, deal 7), Kindle (0, +2 ember, draw 1).

## The rival

The Duchess scores every affordable card in her hand each step: she heals
when hurt, guards when exposed, otherwise plays her hardest attack; Kindle
and Insight set up her next play. She plays one card at a time so the
player can follow her turn.

## What is shown

- Title screen with the rules in one paragraph.
- A table with the player's hand (face-up, readable costs, values and
  houses) and the opponent's hand (face-down backs, with a count), life
  bars, guard badges, ember pips, deck and discard counts, a court record
  of the last plays, the turn banner, the score, and an End Turn button.
- A win screen and a loss screen, each with the score, damage dealt, cards
  played, turns lasted and best score.
- Keyboard (1–7, E, P, R, M, Space) and mouse play; synthesised WebAudio
  sounds (play, hit, heal, win, lose) with M to mute; pause on P and on
  leaving the tab.

## Verification done by the maker

- Rules simulated headlessly across 20 seeds: the autoplay policy wins 8
  and loses 12; a player who never plays a card loses 10 out of 10 — the
  duel is winnable, losable, and ends on its own.
- Interactive play-test in a real headless browser: title → start → play a
  card (ember spent, status announced) → end turn → the Duchess plays her
  cards one at a time → the turn returns; pause and resume; zero page
  errors and zero network requests beyond the game's own files.
- Screenshots are real renders of the game's own code, staged by
  `?shot=title|play|win|loss` with seed 7 through the real rules:
  1-table.jpg (turn 5, both hands, 18 vs 26 life), 2-title.jpg,
  3-win.jpg (victory, score 193, 10 turns), 4-loss.jpg (defeat, 0 life,
  6 turns). Each is a JPEG, 1280×720, under 256 KiB.
